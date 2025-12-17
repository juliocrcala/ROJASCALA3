import { Wrench } from 'lucide-react';

export default function MaintenancePage() {
  const title = localStorage.getItem('maintenanceTitle') || 'Página en Mantenimiento';
  const message = localStorage.getItem('maintenanceMessage') || 'Estamos realizando mejoras en nuestro sitio para brindarte una mejor experiencia.';
  const timeMessage = localStorage.getItem('maintenanceTimeMessage') || 'Volveremos en unos minutos';
  const footerMessage = localStorage.getItem('maintenanceFooterMessage') || 'Gracias por tu paciencia y comprensión.';
  const companyName = localStorage.getItem('maintenanceCompanyName') || 'Rojas Cala Asociados - Asesoría Legal';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-12 text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-amber-100 rounded-full mb-8">
          <Wrench className="w-12 h-12 text-amber-600" />
        </div>

        <h1 className="text-4xl font-bold text-slate-800 mb-4">
          {title}
        </h1>

        <p className="text-xl text-slate-600 mb-8">
          {message}
        </p>

        <div className="bg-slate-50 rounded-xl p-6 mb-8">
          <p className="text-lg text-slate-700 font-medium">
            {timeMessage}
          </p>
        </div>

        <p className="text-slate-500">
          {footerMessage}
        </p>

        <div className="mt-8 pt-8 border-t border-slate-200">
          <p className="text-sm text-slate-400">
            {companyName}
          </p>
        </div>
      </div>
    </div>
  );
}
