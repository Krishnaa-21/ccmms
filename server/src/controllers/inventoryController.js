import { inventoryRepo, complaintRepo, auditLogRepo } from '../repositories/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getInventory = asyncHandler(async (req, res) => {
  const items = await inventoryRepo.findAll();
  const enhanced = items.map((item) => ({
    ...item,
    isLowStock: item.quantityInStock <= (item.reorderLevel || 10)
  }));
  res.json({
    success: true,
    count: enhanced.length,
    data: enhanced
  });
});

export const recordPartsUsed = asyncHandler(async (req, res) => {
  const { complaintId, parts } = req.body;
  // parts is an array of { itemId, quantity }
  if (!Array.isArray(parts) || parts.length === 0) {
    return res.status(400).json({ success: false, message: 'Parts array required' });
  }

  const complaint = await complaintRepo.findById(complaintId);
  if (!complaint) {
    return res.status(404).json({ success: false, message: 'Complaint not found' });
  }

  const recordedParts = [];
  let totalCost = 0;

  for (const p of parts) {
    const item = await inventoryRepo.findById(p.itemId);
    if (item) {
      const qtyUsed = Math.min(item.quantityInStock, p.quantity || 1);
      const newStock = Math.max(0, item.quantityInStock - qtyUsed);
      await inventoryRepo.update(item.id, { quantityInStock: newStock });

      const lineCost = qtyUsed * (item.unitCost || 0);
      totalCost += lineCost;

      recordedParts.push({
        itemId: item.id,
        name: item.name,
        sku: item.sku,
        quantity: qtyUsed,
        unitCost: item.unitCost,
        totalCost: lineCost
      });
    }
  }

  const existingParts = complaint.partsUsed || [];
  const updatedComplaint = await complaintRepo.update(complaintId, {
    partsUsed: [...existingParts, ...recordedParts],
    estimatedCost: (complaint.estimatedCost || 0) + totalCost,
    updatedAt: new Date().toISOString()
  });

  await auditLogRepo.create({
    action: 'INVENTORY_PARTS_CONSUMED',
    entityType: 'Complaint',
    entityId: complaintId,
    actor: { id: req.user.id, name: req.user.name, role: req.user.role },
    details: `Allocated ${recordedParts.length} spare parts (Value: ₹${totalCost}) to work order #${complaint.referenceNumber || complaint.trackingNumber}`
  });

  res.json({
    success: true,
    message: 'Spare parts successfully allocated and stock decremented',
    data: {
      partsAllocated: recordedParts,
      totalCost,
      complaint: updatedComplaint
    }
  });
});

export default {
  getInventory,
  recordPartsUsed
};

