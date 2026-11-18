import React from 'react';
import { ShieldCheck, Phone, Mail, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Institutional Identity */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white">
                <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className="font-heading font-bold text-base text-white tracking-tight">
                CCMMS Portal
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Centralized Campus Complaint & Maintenance Management System for Apex Institute of Technology. Ensuring safe, efficient, and transparent campus facilities.
            </p>
          </div>

          {/* Col 2: Facilities Coverage */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">
              Maintenance Units
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>• Plumbing & Clean Water Networks</li>
              <li>• Electrical Grid & Lighting</li>
              <li>• Campus Wi-Fi & Academic IT</li>
              <li>• Civil, Carpentry & Classrooms</li>
              <li>• Hostel Residential Facilities</li>
            </ul>
          </div>

          {/* Col 3: Portal Links */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">
              Portal Access
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><a href="/login" className="hover:text-white transition-colors">Resident Sign In</a></li>
              <li><a href="/register" className="hover:text-white transition-colors">Student Registration</a></li>
              <li><a href="#how-it-works" className="hover:text-white transition-colors">SLA Guidelines</a></li>
              <li><a href="/api/docs" target="_blank" className="hover:text-white transition-colors">API Documentation</a></li>
            </ul>
          </div>

          {/* Col 4: Campus Helpdesk */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">
              Estate Office Helpline
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-primary-400 shrink-0" />
                <span>24/7 Helpline: +91 80 2345 6789</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-primary-400 shrink-0" />
                <span>facilities@apex.edu</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-primary-400 shrink-0 mt-0.5" />
                <span>Estate Office, Ground Floor, Admin Block, Knowledge Park III</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-800 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Apex Institute of Technology. All rights reserved.</p>
          <p className="flex items-center gap-4">
            <span>Powered by CCMMS Engine v2.0</span>
            <span>&bull;</span>
            <span className="text-emerald-400 font-medium">● Campus Systems Operational</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
