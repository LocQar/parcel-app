import { useState, useRef, type ReactNode } from 'react';

const FinancialModel = () => {
  // Inline Card components
  const Card = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
    <div className={`bg-white rounded-lg shadow ${className}`}>{children}</div>
  );
  const CardHeader = ({ children }: { children: ReactNode }) => <div className="p-4 border-b">{children}</div>;
  const CardTitle = ({ children, className = '' }: { children: ReactNode; className?: string }) => <h2 className={`font-bold ${className}`}>{children}</h2>;
  const CardContent = ({ children, className = '' }: { children: ReactNode; className?: string }) => <div className={`p-4 ${className}`}>{children}</div>;
  
  // Inline icons
  const Download = ({ size = 16 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
    </svg>
  );
  const Upload = ({ size = 16 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
    </svg>
  );
  const AlertCircle = ({ size = 16, className = '' }: { size?: number; className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const defaultInputs = {
    companyName: 'Parcel Locker Co.',
    targetDailyDeliveries: 10000,
    targetUtilizationCommercial: 80,
    compartmentsPerCommercialLocker: 40,
    capacityBufferCommercial: 10,
    avgHoldTimeHoursCommercial: 24,
    targetStudentSubscribers: 5000,
    targetUtilizationStudent: 80,
    compartmentsPerStudentLocker: 40,
    capacityBufferStudent: 10,
    avgHoldTimeHoursStudent: 48,
    targetDailyP2PTransfers: 500,
    targetUtilizationDropBox: 80,
    compartmentsPerDropBox: 20,
    capacityBufferDropBox: 10,
    avgHoldTimeHoursDropBox: 12,
    targetUtilization: 80,
    compartmentsPerLocker: 40,
    capacityBuffer: 10,
    avgHoldTimeHours: 24,
    numStudentLockers: 30,
    studentLockerCapacity: 0,
    studentSubscribers: 500,
    yearlySubFee: 150,
    subscriberGrowthRate: 3,
    rentPerStudentLockerMonth: 200,
    maintenancePerStudentLockerMonth: 150,
    electricityPerStudentLockerMonth: 30,
    studentLockerCostPerUnit: 8000,
    installationPerStudentLocker: 2000,
    numCommercialLockers: 20,
    commercialLockerCapacity: 0,
    deliveriesPerMonth: 2000,
    pricePerDelivery: 3.50,
    deliveryGrowthRate: 5,
    courierCostPerDelivery: 1.50,
    rentPerCommercialLockerMonth: 200,
    maintenancePerCommercialLockerMonth: 150,
    electricityPerCommercialLockerMonth: 30,
    commercialLockerCostPerUnit: 8000,
    installationPerCommercialLocker: 2000,
    numDropBoxes: 20,
    dropBoxCapacity: 0,
    p2pTransfersPerMonth: 300,
    pricePerTransfer: 8,
    p2pGrowthRate: 4,
    courierCostPerTransfer: 4.50,
    rentPerDropBoxMonth: 150,
    maintenancePerDropBoxMonth: 75,
    electricityPerDropBoxMonth: 20,
    dropBoxCostPerUnit: 4000,
    installationPerDropBox: 1000,
    rentInflationRate: 3,
    salaryInflationRate: 3,
    generalInflationRate: 2,
    softwareLicenseMonth: 2000,
    insuranceMonth: 1500,
    numStaff: 3,
    avgSalaryPerStaff: 3500,
    discountRate: 10,
    taxRate: 25,
    depreciationYears: 7,
    workingCapitalPercent: 5,
    financingType: 'equity',
    loanAmount: 0,
    loanInterestRate: 7,
    loanTermYears: 5,
  };

  const [inputs, setInputs] = useState(defaultInputs);

  const handleReset = () => {
    if (window.confirm('Clear all fields to zero?')) {
      const zeroInputs = Object.keys(defaultInputs).reduce((acc: Record<string, any>, key) => {
        if (key === 'companyName') {
          acc[key] = '';
        } else if (key === 'financingType') {
          acc[key] = 'equity';
        } else {
          acc[key] = 0;
        }
        return acc;
      }, {});
      setInputs(zeroInputs as typeof defaultInputs);
    }
  };

  const handleInputChange = (field: string, value: string): void => {
    setInputs(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
  };

  const handleSave = (): void => {
    const blob = new Blob([JSON.stringify({ inputs }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${inputs.companyName.replace(/\s+/g, '-')}-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleLoad = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const result = ev.target?.result as string;
        const data = JSON.parse(result);
        if (data.inputs) setInputs(data.inputs);
      } catch (err) { alert('Error loading file'); }
    };
    reader.readAsText(file);
  };

  const calcProjections = () => {
    const initInv = inputs.numStudentLockers * (inputs.studentLockerCostPerUnit + inputs.installationPerStudentLocker) +
                    inputs.numCommercialLockers * (inputs.commercialLockerCostPerUnit + inputs.installationPerCommercialLocker) +
                    inputs.numDropBoxes * (inputs.dropBoxCostPerUnit + inputs.installationPerDropBox);
    
    let equity = initInv, loanPmt = 0;
    if (inputs.financingType === 'loan' && inputs.loanAmount > 0) {
      const r = inputs.loanInterestRate / 100 / 12, n = inputs.loanTermYears * 12;
      loanPmt = r > 0 ? inputs.loanAmount * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : inputs.loanAmount / n;
      equity = initInv - inputs.loanAmount;
    }
    
    const projs: any[] = [], annDep = inputs.depreciationYears > 0 ? initInv / inputs.depreciationYears : 0;
    
    const monthlyProjs: any[] = [];
    for (let month = 1; month <= 12; month++) {
      const monthlyGrowth = (mo: number) => Math.pow(1 + inputs.subscriberGrowthRate / 100 / 12, mo);
      const deliveryGrowth = (mo: number) => Math.pow(1 + inputs.deliveryGrowthRate / 100 / 12, mo);
      const p2pGrowth = (mo: number) => Math.pow(1 + inputs.p2pGrowthRate / 100 / 12, mo);
      
      const subs = Math.round(inputs.studentSubscribers * monthlyGrowth(month - 1));
      const dels = Math.round(inputs.deliveriesPerMonth * deliveryGrowth(month - 1));
      const p2ps = Math.round(inputs.p2pTransfersPerMonth * p2pGrowth(month - 1));
      
      const subR = subs * inputs.yearlySubFee / 12;
      const delR = dels * inputs.pricePerDelivery;
      const p2pR = p2ps * inputs.pricePerTransfer;
      const rev = subR + delR + p2pR;
      
      const rent = (inputs.numStudentLockers * inputs.rentPerStudentLockerMonth + 
                    inputs.numCommercialLockers * inputs.rentPerCommercialLockerMonth + 
                    inputs.numDropBoxes * inputs.rentPerDropBoxMonth);
      const maint = (inputs.numStudentLockers * inputs.maintenancePerStudentLockerMonth + 
                     inputs.numCommercialLockers * inputs.maintenancePerCommercialLockerMonth + 
                     inputs.numDropBoxes * inputs.maintenancePerDropBoxMonth);
      const elec = (inputs.numStudentLockers * inputs.electricityPerStudentLockerMonth + 
                    inputs.numCommercialLockers * inputs.electricityPerCommercialLockerMonth + 
                    inputs.numDropBoxes * inputs.electricityPerDropBoxMonth);
      const staff = inputs.numStaff * inputs.avgSalaryPerStaff;
      const fixed = inputs.softwareLicenseMonth + inputs.insuranceMonth;
      const cogs = dels * inputs.courierCostPerDelivery + p2ps * inputs.courierCostPerTransfer;
      
      const opex = rent + maint + elec + staff + fixed + cogs;
      const gp = rev - cogs;
      const ebitda = rev - opex;
      const dep = annDep / 12;
      const ebit = ebitda - dep;
      
      const int = inputs.financingType === 'loan' ? loanPmt * (inputs.loanInterestRate / 100 / 12) : 0;
      const tax = Math.max(0, (ebit - int) * (inputs.taxRate / 100));
      const ni = ebit - int - tax;
      
      monthlyProjs.push({
        month, subs, dels, p2ps, rev, subR, delR, p2pR, cogs, gp, opex, rent, staff, maint, elec, fixed, ebitda, dep, ebit, int, tax, ni,
        gm: rev > 0 ? (gp / rev) * 100 : 0,
        em: rev > 0 ? (ebitda / rev) * 100 : 0,
        nm: rev > 0 ? (ni / rev) * 100 : 0
      });
    }
    
    for (let yr = 0; yr <= 5; yr++) {
      if (yr === 0) {
        projs.push({ yr: 0, fcf: -equity, cumFcf: -equity, loan: inputs.financingType === 'loan' ? inputs.loanAmount : 0 });
        continue;
      }
      
      const infl = (r: number) => Math.pow(1 + r / 100, yr - 1);
      const subs = Math.round(inputs.studentSubscribers * Math.pow(1 + inputs.subscriberGrowthRate / 100, yr - 1));
      const dels = Math.round(inputs.deliveriesPerMonth * Math.pow(1 + inputs.deliveryGrowthRate / 100, yr - 1));
      const p2ps = Math.round(inputs.p2pTransfersPerMonth * Math.pow(1 + inputs.p2pGrowthRate / 100, yr - 1));
      
      const subR = subs * inputs.yearlySubFee, delR = dels * inputs.pricePerDelivery * 12, p2pR = p2ps * inputs.pricePerTransfer * 12;
      const rev = subR + delR + p2pR;
      
      const rent = (inputs.numStudentLockers * inputs.rentPerStudentLockerMonth + 
                    inputs.numCommercialLockers * inputs.rentPerCommercialLockerMonth + 
                    inputs.numDropBoxes * inputs.rentPerDropBoxMonth) * 12 * infl(inputs.rentInflationRate);
      const maint = (inputs.numStudentLockers * inputs.maintenancePerStudentLockerMonth + 
                     inputs.numCommercialLockers * inputs.maintenancePerCommercialLockerMonth + 
                     inputs.numDropBoxes * inputs.maintenancePerDropBoxMonth) * 12 * infl(inputs.generalInflationRate);
      const elec = (inputs.numStudentLockers * inputs.electricityPerStudentLockerMonth + 
                    inputs.numCommercialLockers * inputs.electricityPerCommercialLockerMonth + 
                    inputs.numDropBoxes * inputs.electricityPerDropBoxMonth) * 12 * infl(inputs.generalInflationRate);
      const staff = inputs.numStaff * inputs.avgSalaryPerStaff * 12 * infl(inputs.salaryInflationRate);
      const fixed = (inputs.softwareLicenseMonth + inputs.insuranceMonth) * 12 * infl(inputs.generalInflationRate);
      const cogs = dels * inputs.courierCostPerDelivery * 12 + p2ps * inputs.courierCostPerTransfer * 12;
      
      const opex = rent + maint + elec + staff + fixed + cogs, gp = rev - cogs;
      const ebitda = rev - opex, dep = yr <= inputs.depreciationYears ? annDep : 0, ebit = ebitda - dep;
      
      const prevLoan = projs[yr - 1]?.loan || inputs.loanAmount;
      const int = yr <= inputs.loanTermYears ? prevLoan * (inputs.loanInterestRate / 100) : 0;
      const pmt = yr <= inputs.loanTermYears ? loanPmt * 12 : 0, prin = pmt - int;
      
      const ebt = ebit - int, tax = Math.max(0, ebt * (inputs.taxRate / 100)), ni = ebt - tax;
      const wc = rev * (inputs.workingCapitalPercent / 100), wcChg = wc - (projs[yr - 1]?.wc || 0);
      const fcf = ni + dep - wcChg - prin;
      
      const cash = yr === 1 ? equity + fcf : (projs[yr - 1]?.cash || 0) + fcf;
      const accDep = annDep * Math.min(yr, inputs.depreciationYears), ppe = initInv - accDep;
      const assets = cash + wc + ppe, loan = Math.max(0, prevLoan - prin);
      const re = (projs[yr - 1]?.re || 0) + ni, eq = equity + re;
      
      projs.push({
        yr, rev, subR, delR, p2pR, cogs, gp, opex, rent, staff, maint, elec, fixed,
        ebitda, dep, ebit, int, ebt, tax, ni, fcf, cash, wc, assets, ppe, loan, re, eq, pmt, prin,
        gm: rev > 0 ? (gp / rev) * 100 : 0, em: rev > 0 ? (ebitda / rev) * 100 : 0,
        nm: rev > 0 ? (ni / rev) * 100 : 0, cumFcf: (projs[yr - 1]?.cumFcf || 0) + fcf,
        subs, dels, p2ps, roe: eq > 0 ? (ni / eq) * 100 : 0, roa: assets > 0 ? (ni / assets) * 100 : 0,
        de: eq > 0 ? loan / eq : 0
      });
    }
    
    return { projs, monthlyProjs, initInv, equity, loanPmt };
  };

  const { projs, monthlyProjs: _monthlyProjs, initInv: _initInv, equity } = calcProjections();
  const y1 = projs[1] || {};
  
  const _npv = projs.slice(1).reduce((s, p, i) => s + p.fcf / Math.pow(1 + inputs.discountRate / 100, i + 1), -equity);
  const _fcf5 = projs.slice(1).reduce((s, p) => s + p.fcf, 0);
  void _npv; void _fcf5;
  
  let irr = 0.1;
  if (equity > 0) {
    for (let i = 0; i < 20; i++) {
      const n1 = projs.slice(1).reduce((s, p, idx) => s + p.fcf / Math.pow(1 + irr, idx + 1), -equity);
      const n2 = projs.slice(1).reduce((s, p, idx) => s + p.fcf / Math.pow(1 + irr + 0.001, idx + 1), -equity);
      const derivative = (n2 - n1) / 0.001;
      if (Math.abs(derivative) > 0.001) {
        irr = irr - n1 / derivative;
      }
      if (Math.abs(n1) < 0.01) break;
    }
  }
  
  let _pb: number | null = null;
  for (let i = 1; i < projs.length; i++) {
    if (projs[i].cumFcf >= 0) { 
      const prevCumFcf = projs[i - 1]?.cumFcf || -equity;
      if (projs[i].fcf !== 0) {
        _pb = (i - 1) + (-prevCumFcf / projs[i].fcf); 
      }
      break; 
    }
  }
  void _pb;
  
  const _avgEbitda = projs.slice(1).reduce((s, p) => s + (p.em || 0), 0) / 5;
  const _revCagr = (y1?.rev || 0) > 0 && (projs[5]?.rev || 0) > 0 ? (Math.pow((projs[5]?.rev || 0) / (y1?.rev || 1), 0.25) - 1) * 100 : 0;
  void _avgEbitda; void _revCagr;
  
  const fixMo = (inputs.numStudentLockers * inputs.rentPerStudentLockerMonth) + 
               (inputs.numCommercialLockers * inputs.rentPerCommercialLockerMonth) + 
               (inputs.numDropBoxes * inputs.rentPerDropBoxMonth) +
               (inputs.numStudentLockers * inputs.maintenancePerStudentLockerMonth) + 
               (inputs.numCommercialLockers * inputs.maintenancePerCommercialLockerMonth) + 
               (inputs.numDropBoxes * inputs.maintenancePerDropBoxMonth) +
               (inputs.numStudentLockers * inputs.electricityPerStudentLockerMonth) + 
               (inputs.numCommercialLockers * inputs.electricityPerCommercialLockerMonth) + 
               (inputs.numDropBoxes * inputs.electricityPerDropBoxMonth) +
               (inputs.numStaff * inputs.avgSalaryPerStaff) + inputs.softwareLicenseMonth + inputs.insuranceMonth;
  
  const totalUnits = inputs.deliveriesPerMonth + inputs.p2pTransfersPerMonth;
  const varPerU = totalUnits > 0 ? (inputs.courierCostPerDelivery * inputs.deliveriesPerMonth + inputs.courierCostPerTransfer * inputs.p2pTransfersPerMonth) / totalUnits : 0;
  const revPerU = totalUnits > 0 ? ((inputs.pricePerDelivery * inputs.deliveriesPerMonth) + (inputs.pricePerTransfer * inputs.p2pTransfersPerMonth)) / totalUnits : 0;
  const cm = revPerU - varPerU;
  const beU = cm > 0 ? fixMo / cm : 0;
  const _beR = beU * revPerU;
  void _beR;

  const _f = (v: number) => `$${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const _pct = (v: number) => `${v.toFixed(1)}%`;
  void _f; void _pct;

  const Inp = ({ l, fld, pre = '', suf = '' }: { l: string; fld: string; pre?: string; suf?: string }) => (
    <div className="mb-3">
      <label className="block text-sm font-medium mb-1">{l}</label>
      <div className="flex items-center">
        {pre && <span className="mr-2 text-sm">{pre}</span>}
        <input
          type="number"
          step="any"
          value={inputs[fld as keyof typeof inputs]}
          onChange={(e) => handleInputChange(fld, e.target.value)}
          className="border rounded px-3 py-2 w-full text-sm"
        />
        {suf && <span className="ml-2 text-sm">{suf}</span>}
      </div>
    </div>
  );
  void Inp;

  const tabs = [
    { id: 'dashboard', name: 'Dashboard' },
    { id: 'assumptions', name: 'Assumptions' },
    { id: 'infrastructure', name: 'Infrastructure Plan' },
    { id: 'monthly', name: 'Monthly (Y1)' },
    { id: 'revenue', name: 'Revenue' },
    { id: 'cogs', name: 'COGS' },
    { id: 'opex', name: 'OpEx' },
    { id: 'capex', name: 'CapEx' },
    { id: 'financing', name: 'Financing' },
    { id: 'incomestatement', name: 'Income Statement' },
    { id: 'cashflow', name: 'Cash Flow' },
    { id: 'balancesheet', name: 'Balance Sheet' },
    { id: 'uniteconomics', name: 'Unit Economics' },
    { id: 'breakeven', name: 'Break-Even' },
    { id: 'scenarios', name: 'Scenarios' },
    { id: 'valuation', name: 'Valuation' },
    { id: 'kpis', name: 'KPIs' }
  ];

  const TableWrapper = ({ children }: { children: ReactNode }) => (
    <div className="overflow-x-auto -mx-4 px-4">
      {children}
    </div>
  );
  void TableWrapper;

  const pb = projs.length > 0 ? projs.find((p, i) => i > 0 && p.cumFcf >= 0) : null;
  const npv = projs.slice(1).reduce((s, p, i) => s + p.fcf / Math.pow(1 + inputs.discountRate / 100, i + 1), -equity);
  const fcf5 = projs.slice(1).reduce((s, p) => s + p.fcf, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            <h1 className="text-lg font-bold text-gray-800">{inputs.companyName}</h1>
            <p className="text-xs text-gray-500">Financial Model</p>
          </div>
          
          <nav className="flex-1 p-3">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left px-4 py-3 mb-1 rounded-lg text-sm transition-all ${
                  activeTab === tab.id 
                    ? 'bg-blue-600 text-white shadow-md font-medium' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>

          <div className="p-3 border-t border-gray-200 space-y-2">
            <button onClick={handleSave} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
              <Download size={16} /> Save Model
            </button>
            <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
              <Upload size={16} /> Load Model
            </button>
            <button onClick={handleReset} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm">
              <AlertCircle size={16} /> Clear All Fields
            </button>
            <input ref={fileInputRef} type="file" accept=".json" onChange={handleLoad} className="hidden" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-4 md:p-6">
            <div className="space-y-4 pb-8">
              {activeTab === 'dashboard' && (
                <>
                  {/* Top Metrics Banner */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-9 gap-2 mb-6">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-3 text-white shadow">
                      <div className="text-xs opacity-90 mb-1">NPV</div>
                      <div className="text-base md:text-xl font-bold">{_f(npv)}</div>
                      <div className="text-xs opacity-75">@ {inputs.discountRate}%</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-3 text-white shadow">
                      <div className="text-xs opacity-90 mb-1">IRR</div>
                      <div className="text-base md:text-xl font-bold">{_pct(irr * 100)}</div>
                      <div className="text-xs opacity-75">{irr * 100 > inputs.discountRate ? '✓ Hurdle' : '✗'}</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-3 text-white shadow">
                      <div className="text-xs opacity-90 mb-1">Payback</div>
                      <div className="text-base md:text-xl font-bold">{pb ? `${pb.yr.toFixed(1)}y` : 'N/A'}</div>
                      <div className="text-xs opacity-75">{pb && pb.yr <= 5 ? '✓ 5yr' : ''}</div>
                    </div>
                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-3 text-white shadow">
                      <div className="text-xs opacity-90 mb-1">5Y Profit</div>
                      <div className="text-base md:text-xl font-bold">{_f(projs.slice(1).reduce((s, p) => s + p.ni, 0))}</div>
                      <div className="text-xs opacity-75">Net Inc</div>
                    </div>
                    <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg p-3 text-white shadow">
                      <div className="text-xs opacity-90 mb-1">Y1 Rev</div>
                      <div className="text-base md:text-xl font-bold">{_f(y1.rev || 0)}</div>
                      <div className="text-xs opacity-75">{y1.gm ? _pct(y1.gm) : '0.0%'} GM</div>
                    </div>
                    <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg p-3 text-white shadow">
                      <div className="text-xs opacity-90 mb-1">Y1 Profit</div>
                      <div className="text-base md:text-xl font-bold">{_f(y1.ni || 0)}</div>
                      <div className="text-xs opacity-75">{y1.nm ? _pct(y1.nm) : '0.0%'} NM</div>
                    </div>
                    <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg p-3 text-white shadow">
                      <div className="text-xs opacity-90 mb-1">Student</div>
                      <div className="text-base md:text-xl font-bold">
                        {inputs.numStudentLockers > 0 && y1.subs ? Math.round(y1.subs / inputs.numStudentLockers) : 0}
                      </div>
                      <div className="text-xs opacity-75">subs/loc</div>
                    </div>
                    <div className="bg-gradient-to-br from-violet-500 to-violet-600 rounded-lg p-3 text-white shadow">
                      <div className="text-xs opacity-90 mb-1">Commercial</div>
                      <div className="text-base md:text-xl font-bold">
                        {inputs.numCommercialLockers > 0 && y1.dels ? Math.round((y1.dels * 12) / inputs.numCommercialLockers) : 0}
                      </div>
                      <div className="text-xs opacity-75">del/yr</div>
                    </div>
                    <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg p-3 text-white shadow">
                      <div className="text-xs opacity-90 mb-1">DropBox</div>
                      <div className="text-base md:text-xl font-bold">
                        {inputs.numDropBoxes > 0 && y1.p2ps ? Math.round((y1.p2ps * 12) / inputs.numDropBoxes) : 0}
                      </div>
                      <div className="text-xs opacity-75">p2p/yr</div>
                    </div>
                  </div>

                  {/* Large Feature Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 md:p-6 text-white shadow-lg">
                      <div className="text-xs md:text-sm opacity-90 mb-1">NPV @ {inputs.discountRate}%</div>
                      <div className="text-2xl md:text-3xl font-bold">{_f(npv)}</div>
                      <div className="text-xs opacity-75 mt-2">{npv > 0 ? '✓ Positive' : '✗ Negative'}</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 md:p-6 text-white shadow-lg">
                      <div className="text-xs md:text-sm opacity-90 mb-1">IRR</div>
                      <div className="text-2xl md:text-3xl font-bold">{_pct(irr * 100)}</div>
                      <div className="text-xs opacity-75 mt-2">{irr * 100 > inputs.discountRate ? '✓ Above Hurdle' : '✗ Below Hurdle'}</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-4 md:p-6 text-white shadow-lg">
                      <div className="text-xs md:text-sm opacity-90 mb-1">Payback Period</div>
                      <div className="text-2xl md:text-3xl font-bold">{pb ? `${pb.yr.toFixed(1)}y` : 'N/A'}</div>
                      <div className="text-xs opacity-75 mt-2">{pb && pb.yr <= 5 ? '✓ Within 5 years' : '✗ Beyond 5 years'}</div>
                    </div>
                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-4 md:p-6 text-white shadow-lg">
                      <div className="text-xs md:text-sm opacity-90 mb-1">5-Year FCF</div>
                      <div className="text-2xl md:text-3xl font-bold">{_f(fcf5)}</div>
                      <div className="text-xs opacity-75 mt-2">Total Cash Generated</div>
                    </div>
                  </div>

                  {/* Revenue & Margins Cards */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader><CardTitle className="text-lg">Revenue Breakdown (Year 1)</CardTitle></CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                            <span className="text-sm">Subscriptions</span>
                            <span className="font-bold text-sm">{_f(y1.subR)}</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                            <span className="text-sm">Deliveries</span>
                            <span className="font-bold text-sm">{_f(y1.delR)}</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-purple-50 rounded">
                            <span className="text-sm">P2P Transfers</span>
                            <span className="font-bold text-sm">{_f(y1.p2pR)}</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-gray-100 rounded font-bold">
                            <span className="text-sm">Total Revenue</span>
                            <span className="text-sm">{_f(y1.rev)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader><CardTitle className="text-lg">Key Margins (Year 1)</CardTitle></CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                            <span className="text-sm">Gross Margin</span>
                            <span className="font-bold text-sm">{_pct(y1.gm)}</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                            <span className="text-sm">EBITDA Margin</span>
                            <span className="font-bold text-sm">{_pct(y1.em)}</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-purple-50 rounded">
                            <span className="text-sm">Net Margin</span>
                            <span className="font-bold text-sm">{_pct(y1.nm)}</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-orange-50 rounded">
                            <span className="text-sm">Net Income</span>
                            <span className="font-bold text-sm">{_f(y1.ni)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* 5-Year Trend Table */}
                  <Card>
                    <CardHeader><CardTitle className="text-lg">5-Year Revenue & Profitability Trend</CardTitle></CardHeader>
                    <CardContent>
                      <TableWrapper>
                        <table className="w-full text-xs md:text-sm min-w-[500px]">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="px-2 md:px-4 py-2 text-left">Metric</th>
                              {projs.slice(1).map(p => <th key={p.yr} className="px-2 md:px-4 py-2 text-right">Year {p.yr}</th>)}
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-t">
                              <td className="px-2 md:px-4 py-2 font-medium">Revenue</td>
                              {projs.slice(1).map(p => <td key={p.yr} className="px-2 md:px-4 py-2 text-right">{_f(p.rev)}</td>)}
                            </tr>
                            <tr className="border-t bg-green-50">
                              <td className="px-2 md:px-4 py-2 font-medium">EBITDA</td>
                              {projs.slice(1).map(p => <td key={p.yr} className="px-2 md:px-4 py-2 text-right">{_f(p.ebitda)}</td>)}
                            </tr>
                            <tr className="border-t">
                              <td className="px-2 md:px-4 py-2 font-medium">Net Income</td>
                              {projs.slice(1).map(p => <td key={p.yr} className="px-2 md:px-4 py-2 text-right">{_f(p.ni)}</td>)}
                            </tr>
                            <tr className="border-t bg-blue-50">
                              <td className="px-2 md:px-4 py-2 font-medium">Free Cash Flow</td>
                              {projs.slice(1).map(p => <td key={p.yr} className="px-2 md:px-4 py-2 text-right">{_f(p.fcf)}</td>)}
                            </tr>
                          </tbody>
                        </table>
                      </TableWrapper>
                    </CardContent>
                  </Card>
                </>
              )}

              {activeTab === 'assumptions' && (
                <>
                  <Card>
                    <CardHeader><CardTitle>Company Info</CardTitle></CardHeader>
                    <CardContent>
                      <div className="mb-3">
                        <label className="block text-sm font-medium mb-1">Company Name</label>
                        <input
                          type="text"
                          value={inputs.companyName}
                          onChange={(e) => handleInputChange('companyName', e.target.value)}
                          className="border rounded px-3 py-2 w-full text-sm"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader><CardTitle>Student Locker Assumptions</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                      <Inp l="Number of Lockers" fld="numStudentLockers" />
                      <Inp l="Target Subscribers" fld="studentSubscribers" />
                      <Inp l="Yearly Subscription Fee" fld="yearlySubFee" pre="$" />
                      <Inp l="Subscriber Growth Rate" fld="subscriberGrowthRate" suf="%" />
                      <Inp l="Rent per Locker/Month" fld="rentPerStudentLockerMonth" pre="$" />
                      <Inp l="Maintenance/Month" fld="maintenancePerStudentLockerMonth" pre="$" />
                      <Inp l="Electricity/Month" fld="electricityPerStudentLockerMonth" pre="$" />
                      <Inp l="Cost per Unit" fld="studentLockerCostPerUnit" pre="$" />
                      <Inp l="Installation per Unit" fld="installationPerStudentLocker" pre="$" />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader><CardTitle>Commercial Locker Assumptions</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                      <Inp l="Number of Lockers" fld="numCommercialLockers" />
                      <Inp l="Deliveries per Month" fld="deliveriesPerMonth" />
                      <Inp l="Price per Delivery" fld="pricePerDelivery" pre="$" />
                      <Inp l="Delivery Growth Rate" fld="deliveryGrowthRate" suf="%" />
                      <Inp l="Courier Cost per Delivery" fld="courierCostPerDelivery" pre="$" />
                      <Inp l="Rent per Locker/Month" fld="rentPerCommercialLockerMonth" pre="$" />
                      <Inp l="Maintenance/Month" fld="maintenancePerCommercialLockerMonth" pre="$" />
                      <Inp l="Electricity/Month" fld="electricityPerCommercialLockerMonth" pre="$" />
                      <Inp l="Cost per Unit" fld="commercialLockerCostPerUnit" pre="$" />
                      <Inp l="Installation per Unit" fld="installationPerCommercialLocker" pre="$" />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader><CardTitle>Drop Box Assumptions</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                      <Inp l="Number of Drop Boxes" fld="numDropBoxes" />
                      <Inp l="P2P Transfers per Month" fld="p2pTransfersPerMonth" />
                      <Inp l="Price per Transfer" fld="pricePerTransfer" pre="$" />
                      <Inp l="P2P Growth Rate" fld="p2pGrowthRate" suf="%" />
                      <Inp l="Courier Cost per Transfer" fld="courierCostPerTransfer" pre="$" />
                      <Inp l="Rent per Box/Month" fld="rentPerDropBoxMonth" pre="$" />
                      <Inp l="Maintenance/Month" fld="maintenancePerDropBoxMonth" pre="$" />
                      <Inp l="Electricity/Month" fld="electricityPerDropBoxMonth" pre="$" />
                      <Inp l="Cost per Unit" fld="dropBoxCostPerUnit" pre="$" />
                      <Inp l="Installation per Unit" fld="installationPerDropBox" pre="$" />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader><CardTitle>Operating Assumptions</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                      <Inp l="Number of Staff" fld="numStaff" />
                      <Inp l="Average Salary per Staff" fld="avgSalaryPerStaff" pre="$" />
                      <Inp l="Software License/Month" fld="softwareLicenseMonth" pre="$" />
                      <Inp l="Insurance/Month" fld="insuranceMonth" pre="$" />
                      <Inp l="Rent Inflation Rate" fld="rentInflationRate" suf="%" />
                      <Inp l="Salary Inflation Rate" fld="salaryInflationRate" suf="%" />
                      <Inp l="General Inflation Rate" fld="generalInflationRate" suf="%" />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader><CardTitle>Financial Parameters</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                      <Inp l="Discount Rate" fld="discountRate" suf="%" />
                      <Inp l="Tax Rate" fld="taxRate" suf="%" />
                      <Inp l="Depreciation Period" fld="depreciationYears" suf="years" />
                      <Inp l="Working Capital" fld="workingCapitalPercent" suf="% of Rev" />
                      <div className="mb-3">
                        <label className="block text-sm font-medium mb-1">Financing Type</label>
                        <select
                          value={inputs.financingType}
                          onChange={(e) => handleInputChange('financingType', e.target.value)}
                          className="border rounded px-3 py-2 w-full text-sm"
                        >
                          <option value="equity">Equity</option>
                          <option value="loan">Loan</option>
                        </select>
                      </div>
                      {inputs.financingType === 'loan' && (
                        <>
                          <Inp l="Loan Amount" fld="loanAmount" pre="$" />
                          <Inp l="Loan Interest Rate" fld="loanInterestRate" suf="%" />
                          <Inp l="Loan Term" fld="loanTermYears" suf="years" />
                        </>
                      )}
                    </CardContent>
                  </Card>
                </>
              )}

              {activeTab === 'infrastructure' && (
                <Card>
                  <CardHeader><CardTitle>Infrastructure Capacity Planning</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="border-l-4 border-blue-500 pl-4">
                          <h3 className="font-bold text-blue-700">Student Lockers</h3>
                          <p className="text-sm text-gray-600 mt-1">Qty: {inputs.numStudentLockers}</p>
                          <p className="text-sm text-gray-600">Subs: {y1.subs || 0}</p>
                          <p className="text-sm text-gray-600">Density: {inputs.numStudentLockers > 0 ? Math.round((y1.subs || 0) / inputs.numStudentLockers) : 0} per locker</p>
                        </div>
                        <div className="border-l-4 border-green-500 pl-4">
                          <h3 className="font-bold text-green-700">Commercial Lockers</h3>
                          <p className="text-sm text-gray-600 mt-1">Qty: {inputs.numCommercialLockers}</p>
                          <p className="text-sm text-gray-600">Deliveries/Yr: {inputs.numCommercialLockers > 0 ? Math.round(((y1.dels || 0) * 12) / inputs.numCommercialLockers) : 0}</p>
                          <p className="text-sm text-gray-600">Total Y1: {y1.dels || 0}/mo</p>
                        </div>
                        <div className="border-l-4 border-purple-500 pl-4">
                          <h3 className="font-bold text-purple-700">Drop Boxes</h3>
                          <p className="text-sm text-gray-600 mt-1">Qty: {inputs.numDropBoxes}</p>
                          <p className="text-sm text-gray-600">Transfers/Yr: {inputs.numDropBoxes > 0 ? Math.round(((y1.p2ps || 0) * 12) / inputs.numDropBoxes) : 0}</p>
                          <p className="text-sm text-gray-600">Total Y1: {y1.p2ps || 0}/mo</p>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded">
                        <p className="text-sm font-medium">Total Initial Investment: <span className="text-lg font-bold">{_f(_initInv)}</span></p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeTab === 'monthly' && (
                <Card>
                  <CardHeader><CardTitle>Year 1 Monthly Breakdown</CardTitle></CardHeader>
                  <CardContent>
                    <TableWrapper>
                      <table className="w-full text-xs">
                        <thead className="bg-gray-50 border-b font-medium">
                          <tr>
                            <th className="px-3 py-2 text-left">Mo</th>
                            <th className="px-3 py-2 text-right">Subs</th>
                            <th className="px-3 py-2 text-right">Dels</th>
                            <th className="px-3 py-2 text-right">P2P</th>
                            <th className="px-3 py-2 text-right">Revenue</th>
                            <th className="px-3 py-2 text-right">COGS</th>
                            <th className="px-3 py-2 text-right">OpEx</th>
                            <th className="px-3 py-2 text-right">EBITDA</th>
                            <th className="px-3 py-2 text-right">NI</th>
                          </tr>
                        </thead>
                        <tbody>
                          {_monthlyProjs.map((m, i) => (
                            <tr key={i} className="border-b hover:bg-gray-50">
                              <td className="px-3 py-2">{m.month}</td>
                              <td className="px-3 py-2 text-right">{m.subs}</td>
                              <td className="px-3 py-2 text-right">{m.dels}</td>
                              <td className="px-3 py-2 text-right">{m.p2ps}</td>
                              <td className="px-3 py-2 text-right">{_f(m.rev)}</td>
                              <td className="px-3 py-2 text-right">{_f(m.cogs)}</td>
                              <td className="px-3 py-2 text-right">{_f(m.opex)}</td>
                              <td className="px-3 py-2 text-right font-medium">{_f(m.ebitda)}</td>
                              <td className="px-3 py-2 text-right font-bold">{_f(m.ni)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </TableWrapper>
                  </CardContent>
                </Card>
              )}

              {activeTab === 'revenue' && (
                <Card>
                  <CardHeader><CardTitle>Revenue Analysis</CardTitle></CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b">
                          <tr>
                            <th className="px-4 py-2 text-left">Year</th>
                            <th className="px-4 py-2 text-right">Subscriptions</th>
                            <th className="px-4 py-2 text-right">Deliveries</th>
                            <th className="px-4 py-2 text-right">P2P Transfers</th>
                            <th className="px-4 py-2 text-right">Total Revenue</th>
                            <th className="px-4 py-2 text-right">Margin %</th>
                          </tr>
                        </thead>
                        <tbody>
                          {projs.slice(1).map((p, i) => (
                            <tr key={i} className="border-b hover:bg-gray-50">
                              <td className="px-4 py-2">{p.yr}</td>
                              <td className="px-4 py-2 text-right">{_f(p.subR)}</td>
                              <td className="px-4 py-2 text-right">{_f(p.delR)}</td>
                              <td className="px-4 py-2 text-right">{_f(p.p2pR)}</td>
                              <td className="px-4 py-2 text-right font-bold">{_f(p.rev)}</td>
                              <td className="px-4 py-2 text-right">{_pct(p.gm)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeTab === 'cogs' && (
                <Card>
                  <CardHeader><CardTitle>Cost of Goods Sold (COGS)</CardTitle></CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b">
                          <tr>
                            <th className="px-4 py-2 text-left">Year</th>
                            <th className="px-4 py-2 text-right">COGS</th>
                            <th className="px-4 py-2 text-right">Gross Profit</th>
                            <th className="px-4 py-2 text-right">Gross Margin %</th>
                          </tr>
                        </thead>
                        <tbody>
                          {projs.slice(1).map((p, i) => (
                            <tr key={i} className="border-b hover:bg-gray-50">
                              <td className="px-4 py-2">{p.yr}</td>
                              <td className="px-4 py-2 text-right">{_f(p.cogs)}</td>
                              <td className="px-4 py-2 text-right font-bold">{_f(p.gp)}</td>
                              <td className="px-4 py-2 text-right">{_pct(p.gm)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeTab === 'opex' && (
                <Card>
                  <CardHeader><CardTitle>Operating Expenses</CardTitle></CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b">
                          <tr>
                            <th className="px-4 py-2 text-left">Year</th>
                            <th className="px-4 py-2 text-right">Rent</th>
                            <th className="px-4 py-2 text-right">Staff</th>
                            <th className="px-4 py-2 text-right">Maint</th>
                            <th className="px-4 py-2 text-right">Elec</th>
                            <th className="px-4 py-2 text-right">Fixed</th>
                            <th className="px-4 py-2 text-right">Total OpEx</th>
                          </tr>
                        </thead>
                        <tbody>
                          {projs.slice(1).map((p, i) => (
                            <tr key={i} className="border-b hover:bg-gray-50">
                              <td className="px-4 py-2">{p.yr}</td>
                              <td className="px-4 py-2 text-right">{_f(p.rent)}</td>
                              <td className="px-4 py-2 text-right">{_f(p.staff)}</td>
                              <td className="px-4 py-2 text-right">{_f(p.maint)}</td>
                              <td className="px-4 py-2 text-right">{_f(p.elec)}</td>
                              <td className="px-4 py-2 text-right">{_f(p.fixed)}</td>
                              <td className="px-4 py-2 text-right font-bold">{_f(p.opex)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeTab === 'capex' && (
                <Card>
                  <CardHeader><CardTitle>Capital Expenditures</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-blue-50 p-4 rounded border border-blue-200">
                          <p className="text-xs text-gray-600">Student Lockers</p>
                          <p className="text-xl font-bold text-blue-600">{_f(inputs.numStudentLockers * (inputs.studentLockerCostPerUnit + inputs.installationPerStudentLocker))}</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded border border-green-200">
                          <p className="text-xs text-gray-600">Commercial Lockers</p>
                          <p className="text-xl font-bold text-green-600">{_f(inputs.numCommercialLockers * (inputs.commercialLockerCostPerUnit + inputs.installationPerCommercialLocker))}</p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded border border-purple-200">
                          <p className="text-xs text-gray-600">Drop Boxes</p>
                          <p className="text-xl font-bold text-purple-600">{_f(inputs.numDropBoxes * (inputs.dropBoxCostPerUnit + inputs.installationPerDropBox))}</p>
                        </div>
                      </div>
                      <div className="bg-gray-100 p-4 rounded font-bold text-lg">
                        Total Initial Investment: {_f(_initInv)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeTab === 'incomestatement' && (
                <Card>
                  <CardHeader><CardTitle>Income Statement</CardTitle></CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b">
                          <tr>
                            <th className="px-4 py-2 text-left">Year</th>
                            <th className="px-4 py-2 text-right">Revenue</th>
                            <th className="px-4 py-2 text-right">EBITDA</th>
                            <th className="px-4 py-2 text-right">Depreciation</th>
                            <th className="px-4 py-2 text-right">EBIT</th>
                            <th className="px-4 py-2 text-right">Interest</th>
                            <th className="px-4 py-2 text-right">EBT</th>
                            <th className="px-4 py-2 text-right">Tax</th>
                            <th className="px-4 py-2 text-right">Net Income</th>
                          </tr>
                        </thead>
                        <tbody>
                          {projs.slice(1).map((p, i) => (
                            <tr key={i} className="border-b hover:bg-gray-50">
                              <td className="px-4 py-2">{p.yr}</td>
                              <td className="px-4 py-2 text-right">{_f(p.rev)}</td>
                              <td className="px-4 py-2 text-right">{_f(p.ebitda)}</td>
                              <td className="px-4 py-2 text-right">{_f(p.dep)}</td>
                              <td className="px-4 py-2 text-right">{_f(p.ebit)}</td>
                              <td className="px-4 py-2 text-right">{_f(p.int)}</td>
                              <td className="px-4 py-2 text-right">{_f(p.ebt)}</td>
                              <td className="px-4 py-2 text-right">{_f(p.tax)}</td>
                              <td className="px-4 py-2 text-right font-bold">{_f(p.ni)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeTab === 'cashflow' && (
                <Card>
                  <CardHeader><CardTitle>Cash Flow Statement</CardTitle></CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b">
                          <tr>
                            <th className="px-4 py-2 text-left">Year</th>
                            <th className="px-4 py-2 text-right">Net Income</th>
                            <th className="px-4 py-2 text-right">+ Depreciation</th>
                            <th className="px-4 py-2 text-right">- CapEx</th>
                            <th className="px-4 py-2 text-right">Free Cash Flow</th>
                            <th className="px-4 py-2 text-right">Cumulative FCF</th>
                          </tr>
                        </thead>
                        <tbody>
                          {projs.slice(1).map((p, i) => (
                            <tr key={i} className={`border-b hover:bg-gray-50 ${p.cumFcf >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                              <td className="px-4 py-2">{p.yr}</td>
                              <td className="px-4 py-2 text-right">{_f(p.ni)}</td>
                              <td className="px-4 py-2 text-right">{_f(p.dep)}</td>
                              <td className="px-4 py-2 text-right">-</td>
                              <td className="px-4 py-2 text-right font-bold">{_f(p.fcf)}</td>
                              <td className="px-4 py-2 text-right font-bold text-lg">{_f(p.cumFcf)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeTab === 'balancesheet' && (
                <Card>
                  <CardHeader><CardTitle>Balance Sheet</CardTitle></CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b">
                          <tr>
                            <th className="px-4 py-2 text-left">Year</th>
                            <th className="px-4 py-2 text-right">Cash</th>
                            <th className="px-4 py-2 text-right">PPE</th>
                            <th className="px-4 py-2 text-right">Total Assets</th>
                            <th className="px-4 py-2 text-right">Debt</th>
                            <th className="px-4 py-2 text-right">Equity</th>
                            <th className="px-4 py-2 text-right">D/E</th>
                          </tr>
                        </thead>
                        <tbody>
                          {projs.slice(1).map((p, i) => (
                            <tr key={i} className="border-b hover:bg-gray-50">
                              <td className="px-4 py-2">{p.yr}</td>
                              <td className="px-4 py-2 text-right">{_f(p.cash)}</td>
                              <td className="px-4 py-2 text-right">{_f(p.ppe)}</td>
                              <td className="px-4 py-2 text-right font-bold">{_f(p.assets)}</td>
                              <td className="px-4 py-2 text-right">{_f(p.loan)}</td>
                              <td className="px-4 py-2 text-right font-bold">{_f(p.eq)}</td>
                              <td className="px-4 py-2 text-right">{p.de.toFixed(2)}x</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeTab === 'uniteconomics' && (
                <Card>
                  <CardHeader><CardTitle>Unit Economics</CardTitle></CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="border-l-4 border-blue-500 pl-4">
                        <h3 className="font-bold">Return on Equity (ROE)</h3>
                        <p className="text-2xl font-bold text-blue-600 mt-2">{_pct(projs[5]?.roe || 0)}</p>
                      </div>
                      <div className="border-l-4 border-green-500 pl-4">
                        <h3 className="font-bold">Return on Assets (ROA)</h3>
                        <p className="text-2xl font-bold text-green-600 mt-2">{_pct(projs[5]?.roa || 0)}</p>
                      </div>
                      <div className="border-l-4 border-purple-500 pl-4">
                        <h3 className="font-bold">Y5 EBITDA Margin</h3>
                        <p className="text-2xl font-bold text-purple-600 mt-2">{_pct(projs[5]?.em || 0)}</p>
                      </div>
                      <div className="border-l-4 border-orange-500 pl-4">
                        <h3 className="font-bold">Y5 Net Margin</h3>
                        <p className="text-2xl font-bold text-orange-600 mt-2">{_pct(projs[5]?.nm || 0)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeTab === 'breakeven' && (
                <Card>
                  <CardHeader><CardTitle>Break-Even Analysis</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-blue-50 p-4 rounded">
                          <p className="text-xs text-gray-600">Fixed Costs/Month</p>
                          <p className="text-xl font-bold text-blue-600">{_f(fixMo)}</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded">
                          <p className="text-xs text-gray-600">Contribution Margin</p>
                          <p className="text-xl font-bold text-green-600">{_f(cm)}</p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded">
                          <p className="text-xs text-gray-600">Break-Even Units</p>
                          <p className="text-xl font-bold text-purple-600">{Math.round(beU)}</p>
                        </div>
                      </div>
                      <div className="bg-orange-50 p-4 rounded border-l-4 border-orange-400">
                        <p className="text-sm text-gray-600">Monthly Break-Even Revenue</p>
                        <p className="text-3xl font-bold text-orange-600">{_f(_beR)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeTab === 'scenarios' && (
                <Card>
                  <CardHeader><CardTitle>Scenario Analysis</CardTitle></CardHeader>
                  <CardContent>
                    <p className="text-gray-500">Adjust assumptions above to see instant impact on NPV, IRR, and other metrics. The model is fully responsive.</p>
                  </CardContent>
                </Card>
              )}

              {activeTab === 'valuation' && (
                <Card>
                  <CardHeader><CardTitle>Valuation Metrics</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="border p-4 rounded">
                          <p className="text-xs text-gray-600 mb-1">NPV (10% discount)</p>
                          <p className="text-2xl font-bold text-blue-600">{_f(npv)}</p>
                        </div>
                        <div className="border p-4 rounded">
                          <p className="text-xs text-gray-600 mb-1">Internal Rate of Return</p>
                          <p className="text-2xl font-bold text-green-600">{_pct(irr * 100)}</p>
                        </div>
                        <div className="border p-4 rounded">
                          <p className="text-xs text-gray-600 mb-1">Payback Period</p>
                          <p className="text-2xl font-bold text-purple-600">{pb ? `${pb.yr.toFixed(1)} years` : 'N/A'}</p>
                        </div>
                        <div className="border p-4 rounded">
                          <p className="text-xs text-gray-600 mb-1">5-Year Cumulative FCF</p>
                          <p className="text-2xl font-bold text-orange-600">{_f(projs[5]?.cumFcf || 0)}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeTab === 'kpis' && (
                <Card>
                  <CardHeader><CardTitle>Key Performance Indicators</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <div className="border p-3 rounded text-center">
                          <p className="text-xs text-gray-600">Y1 Revenue</p>
                          <p className="font-bold text-lg">{_f(y1.rev || 0)}</p>
                        </div>
                        <div className="border p-3 rounded text-center">
                          <p className="text-xs text-gray-600">Y1 Gross Margin</p>
                          <p className="font-bold text-lg">{_pct(y1.gm || 0)}</p>
                        </div>
                        <div className="border p-3 rounded text-center">
                          <p className="text-xs text-gray-600">Y1 EBITDA Margin</p>
                          <p className="font-bold text-lg">{_pct(y1.em || 0)}</p>
                        </div>
                        <div className="border p-3 rounded text-center">
                          <p className="text-xs text-gray-600">Y1 Net Margin</p>
                          <p className="font-bold text-lg">{_pct(y1.nm || 0)}</p>
                        </div>
                        <div className="border p-3 rounded text-center">
                          <p className="text-xs text-gray-600">Y5 Revenue CAGR</p>
                          <p className="font-bold text-lg">{_revCagr.toFixed(1)}%</p>
                        </div>
                        <div className="border p-3 rounded text-center">
                          <p className="text-xs text-gray-600">Avg EBITDA Margin</p>
                          <p className="font-bold text-lg">{_avgEbitda.toFixed(1)}%</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialModel;
