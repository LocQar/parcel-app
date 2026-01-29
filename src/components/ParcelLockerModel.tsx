import { useState, useRef, type ChangeEvent } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Download, Upload } from 'lucide-react';

interface Inputs {
  numLockers: number;
  numDropBoxes: number;
  avgCompartmentsPerLocker: number;
  avgCompartmentsPerDropBox: number;
  rentPerLockerMonth: number;
  rentPerDropBoxMonth: number;
  studentSubscribers: number;
  yearlySubFee: number;
  deliveriesPerMonth: number;
  pricePerDelivery: number;
  p2pTransfersPerMonth: number;
  pricePerTransfer: number;
  subscriberGrowthRate: number;
  deliveryGrowthRate: number;
  p2pGrowthRate: number;
  rentInflationRate: number;
  salaryInflationRate: number;
  generalInflationRate: number;
  lockerCostPerUnit: number;
  dropBoxCostPerUnit: number;
  installationPerLocker: number;
  installationPerDropBox: number;
  maintenancePerLockerMonth: number;
  maintenancePerDropBoxMonth: number;
  softwareLicenseMonth: number;
  insuranceMonth: number;
  numStaff: number;
  avgSalaryPerStaff: number;
  electricityPerLockerMonth: number;
  electricityPerDropBoxMonth: number;
  courierCostPerDelivery: number;
  courierCostPerTransfer: number;
  discountRate: number;
  financingType: 'equity' | 'loan';
  loanAmount: number;
  loanInterestRate: number;
  loanTermYears: number;
}

interface YearData {
  year: number;
  cashFlow: number;
  cumulativeCashFlow: number;
  subscribers?: number;
  deliveriesPerMonth?: number;
  p2pPerMonth?: number;
  revenue?: number;
  costs?: number;
  profit?: number;
  profitMargin?: number;
  subRevenue?: number;
  deliveryRevenue?: number;
  p2pRevenue?: number;
  rentCost?: number;
  maintenanceCost?: number;
  electricityCost?: number;
  staffCost?: number;
  fixedCost?: number;
  courierCost?: number;
}

const ParcelLockerModel = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [inputs, setInputs] = useState<Inputs>({
    numLockers: 50,
    numDropBoxes: 20,
    avgCompartmentsPerLocker: 40,
    avgCompartmentsPerDropBox: 15,
    rentPerLockerMonth: 200,
    rentPerDropBoxMonth: 150,
    studentSubscribers: 500,
    yearlySubFee: 150,
    deliveriesPerMonth: 2000,
    pricePerDelivery: 3.50,
    p2pTransfersPerMonth: 300,
    pricePerTransfer: 8,
    subscriberGrowthRate: 3,
    deliveryGrowthRate: 5,
    p2pGrowthRate: 4,
    rentInflationRate: 3,
    salaryInflationRate: 3,
    generalInflationRate: 2,
    lockerCostPerUnit: 8000,
    dropBoxCostPerUnit: 4000,
    installationPerLocker: 2000,
    installationPerDropBox: 1000,
    maintenancePerLockerMonth: 150,
    maintenancePerDropBoxMonth: 75,
    softwareLicenseMonth: 2000,
    insuranceMonth: 1500,
    numStaff: 3,
    avgSalaryPerStaff: 3500,
    electricityPerLockerMonth: 30,
    electricityPerDropBoxMonth: 20,
    courierCostPerDelivery: 1.50,
    courierCostPerTransfer: 4.50,
    discountRate: 10,
    financingType: 'equity',
    loanAmount: 0,
    loanInterestRate: 7,
    loanTermYears: 5,
  });

  const handleInputChange = (field: keyof Inputs, value: string) => {
    setInputs(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
  };

  const handleSaveScenario = () => {
    const scenario = {
      name: `Parcel Locker Model - ${new Date().toLocaleDateString()}`,
      date: new Date().toISOString(),
      inputs: inputs
    };
    const dataStr = JSON.stringify(scenario, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `parcel-locker-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleLoadScenario = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const scenario = JSON.parse(e.target?.result as string);
        if (scenario.inputs) setInputs(scenario.inputs);
      } catch {
        alert('Error loading file');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const calculateProjections = () => {
    const years = [0, 1, 2, 3, 4, 5];
    const projections: YearData[] = [];
    const initialInvestment = inputs.numLockers * (inputs.lockerCostPerUnit + inputs.installationPerLocker) +
                             inputs.numDropBoxes * (inputs.dropBoxCostPerUnit + inputs.installationPerDropBox);

    for (const year of years) {
      const yearData: YearData = { year, cashFlow: 0, cumulativeCashFlow: 0 };
      if (year === 0) {
        yearData.cashFlow = -initialInvestment;
        yearData.cumulativeCashFlow = -initialInvestment;
        projections.push(yearData);
        continue;
      }

      const monthsElapsed = (year - 1) * 12;
      const subscriberMult = Math.pow(1 + inputs.subscriberGrowthRate / 100, monthsElapsed);
      const deliveryMult = Math.pow(1 + inputs.deliveryGrowthRate / 100, monthsElapsed);
      const p2pMult = Math.pow(1 + inputs.p2pGrowthRate / 100, monthsElapsed);

      const rentInflMult = Math.pow(1 + inputs.rentInflationRate / 100, year - 1);
      const salaryInflMult = Math.pow(1 + inputs.salaryInflationRate / 100, year - 1);
      const genInflMult = Math.pow(1 + inputs.generalInflationRate / 100, year - 1);

      const subscribers = Math.round(inputs.studentSubscribers * subscriberMult);
      const deliveriesPerMonth = Math.round(inputs.deliveriesPerMonth * deliveryMult);
      const p2pPerMonth = Math.round(inputs.p2pTransfersPerMonth * p2pMult);

      const annualSubRev = subscribers * inputs.yearlySubFee;
      const annualDelRev = deliveriesPerMonth * inputs.pricePerDelivery * 12;
      const annualP2PRev = p2pPerMonth * inputs.pricePerTransfer * 12;
      const totalRev = annualSubRev + annualDelRev + annualP2PRev;

      const annualRent = (inputs.numLockers * inputs.rentPerLockerMonth + inputs.numDropBoxes * inputs.rentPerDropBoxMonth) * 12 * rentInflMult;
      const annualMaint = (inputs.numLockers * inputs.maintenancePerLockerMonth + inputs.numDropBoxes * inputs.maintenancePerDropBoxMonth) * 12 * genInflMult;
      const annualElec = (inputs.numLockers * inputs.electricityPerLockerMonth + inputs.numDropBoxes * inputs.electricityPerDropBoxMonth) * 12 * genInflMult;
      const annualStaff = inputs.numStaff * inputs.avgSalaryPerStaff * 12 * salaryInflMult;
      const annualFixed = (inputs.softwareLicenseMonth + inputs.insuranceMonth) * 12 * genInflMult;
      const annualDelCost = deliveriesPerMonth * inputs.courierCostPerDelivery * 12;
      const annualTransCost = p2pPerMonth * inputs.courierCostPerTransfer * 12;

      const totalCosts = annualRent + annualMaint + annualElec + annualStaff + annualFixed + annualDelCost + annualTransCost;
      const annualProfit = totalRev - totalCosts;

      yearData.subscribers = subscribers;
      yearData.deliveriesPerMonth = deliveriesPerMonth;
      yearData.p2pPerMonth = p2pPerMonth;
      yearData.revenue = totalRev;
      yearData.costs = totalCosts;
      yearData.profit = annualProfit;
      yearData.profitMargin = (annualProfit / totalRev) * 100;
      yearData.cashFlow = annualProfit;
      yearData.cumulativeCashFlow = (projections[year - 1]?.cumulativeCashFlow || 0) + annualProfit;
      yearData.subRevenue = annualSubRev;
      yearData.deliveryRevenue = annualDelRev;
      yearData.p2pRevenue = annualP2PRev;
      yearData.rentCost = annualRent;
      yearData.maintenanceCost = annualMaint;
      yearData.electricityCost = annualElec;
      yearData.staffCost = annualStaff;
      yearData.fixedCost = annualFixed;
      yearData.courierCost = annualDelCost + annualTransCost;

      projections.push(yearData);
    }

    return { projections, initialInvestment };
  };

  const calculateMetrics = (projections: YearData[], initialInvestment: number) => {
    const discountRate = inputs.discountRate / 100;
    let npv = -initialInvestment;
    for (let i = 1; i < projections.length; i++) {
      npv += projections[i].cashFlow / Math.pow(1 + discountRate, i);
    }

    const calculateNPVAtRate = (rate: number) => {
      let npvCalc = -initialInvestment;
      for (let i = 1; i < projections.length; i++) {
        npvCalc += projections[i].cashFlow / Math.pow(1 + rate, i);
      }
      return npvCalc;
    };

    let irr = 0.1;
    for (let iteration = 0; iteration < 20; iteration++) {
      const npvAtRate = calculateNPVAtRate(irr);
      const npvAtRatePlus = calculateNPVAtRate(irr + 0.001);
      const derivative = (npvAtRatePlus - npvAtRate) / 0.001;
      irr = irr - npvAtRate / derivative;
      if (Math.abs(npvAtRate) < 0.01) break;
    }

    let paybackYears: number | null = null;
    for (let i = 1; i < projections.length; i++) {
      if (projections[i].cumulativeCashFlow >= 0) {
        const prevCum = projections[i - 1].cumulativeCashFlow;
        const currentProfit = projections[i].profit || 0;
        const monthsInto = (-prevCum / currentProfit) * 12;
        paybackYears = (i - 1) + (monthsInto / 12);
        break;
      }
    }

    const fiveYearRev = projections.slice(1, 6).reduce((sum, p) => sum + (p.revenue || 0), 0);
    const fiveYearProfit = projections.slice(1, 6).reduce((sum, p) => sum + (p.profit || 0), 0);
    const avgAnnualReturn = fiveYearProfit / 5;
    const simpleROI = (fiveYearProfit / initialInvestment) * 100;

    return { npv, irr: irr * 100, paybackYears, fiveYearRev, fiveYearProfit, avgAnnualReturn, simpleROI };
  };

  const { projections, initialInvestment } = calculateProjections();
  const metrics = calculateMetrics(projections, initialInvestment);
  const year1 = projections[1];

  const fmt = (v: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);
  const pct = (v: number) => `${v.toFixed(1)}%`;

  const InputField = ({ label, field, prefix = '', suffix = '', step = 'any' }: { label: string; field: keyof Inputs; prefix?: string; suffix?: string; step?: string }) => (
    <div className="mb-3">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="flex items-center">
        {prefix && <span className="text-gray-500 mr-1">{prefix}</span>}
        <input type="number" value={inputs[field]} onChange={(e) => handleInputChange(field, e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" step={step} />
        {suffix && <span className="text-gray-500 ml-1">{suffix}</span>}
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Parcel Locker Financial Model</h1>
          <p className="text-gray-600">5-year projections with growth, inflation, NPV & IRR</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleSaveScenario} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Download size={18} />Save
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            <Upload size={18} />Load
          </button>
          <input ref={fileInputRef} type="file" accept=".json" onChange={handleLoadScenario} className="hidden" />
        </div>
      </div>

      {/* Top Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className={`${metrics.npv > 0 ? 'bg-green-50' : 'bg-red-50'} p-4 rounded-lg border`}>
          <div className="text-sm text-gray-600 mb-1">Net Present Value</div>
          <div className={`text-2xl font-bold ${metrics.npv > 0 ? 'text-green-700' : 'text-red-700'}`}>{fmt(metrics.npv)}</div>
          <div className="text-xs text-gray-500">@ {inputs.discountRate}% discount</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border">
          <div className="text-sm text-gray-600 mb-1">Internal Rate of Return</div>
          <div className="text-2xl font-bold text-purple-700">{pct(metrics.irr)}</div>
          <div className="text-xs text-gray-500">IRR over 5 years</div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg border">
          <div className="text-sm text-gray-600 mb-1">Payback Period</div>
          <div className="text-2xl font-bold text-blue-700">{metrics.paybackYears ? `${metrics.paybackYears.toFixed(1)} yrs` : 'N/A'}</div>
          <div className="text-xs text-gray-500">Initial: {fmt(initialInvestment)}</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg border">
          <div className="text-sm text-gray-600 mb-1">5-Year Profit</div>
          <div className="text-2xl font-bold text-orange-700">{fmt(metrics.fiveYearProfit)}</div>
          <div className="text-xs text-gray-500">Avg: {fmt(metrics.avgAnnualReturn)}/yr</div>
        </div>
      </div>

      {/* Year 1 Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="text-sm font-medium text-gray-600 mb-1">Year 1 Revenue</div>
          <div className="text-2xl font-bold text-green-700 mb-1">{fmt(year1.revenue || 0)}</div>
          <div className="text-xs text-gray-500">{fmt((year1.revenue || 0) / 12)}/month avg</div>
        </div>
        <div className={`${(year1.profit || 0) > 0 ? 'bg-blue-50' : 'bg-red-50'} p-4 rounded-lg border`}>
          <div className="text-sm font-medium text-gray-600 mb-1">Year 1 Profit</div>
          <div className={`text-2xl font-bold ${(year1.profit || 0) > 0 ? 'text-blue-700' : 'text-red-700'} mb-1`}>{fmt(year1.profit || 0)}</div>
          <div className="text-xs text-gray-500">{pct(year1.profitMargin || 0)} margin</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="text-sm font-medium text-gray-600 mb-1">Locker Utilization</div>
          <div className="text-2xl font-bold text-purple-700 mb-1">
            {pct(((year1.deliveriesPerMonth || 0) / (inputs.numLockers * inputs.avgCompartmentsPerLocker)) * 100)}
          </div>
          <div className="text-xs text-gray-500">
            {(year1.deliveriesPerMonth || 0).toLocaleString()} / {(inputs.numLockers * inputs.avgCompartmentsPerLocker).toLocaleString()} capacity
          </div>
        </div>
        <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
          <div className="text-sm font-medium text-gray-600 mb-1">Drop Box Utilization</div>
          <div className="text-2xl font-bold text-indigo-700 mb-1">
            {pct(((year1.p2pPerMonth || 0) / (inputs.numDropBoxes * inputs.avgCompartmentsPerDropBox)) * 100)}
          </div>
          <div className="text-xs text-gray-500">
            {(year1.p2pPerMonth || 0).toLocaleString()} / {(inputs.numDropBoxes * inputs.avgCompartmentsPerDropBox).toLocaleString()} capacity
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader><CardTitle>Assumptions</CardTitle></CardHeader>
            <CardContent className="max-h-[800px] overflow-y-auto space-y-4">
              <div>
                <h3 className="font-semibold mb-3">Infrastructure</h3>
                <InputField label="Delivery Lockers" field="numLockers" step="1" />
                <InputField label="Compartments/Locker" field="avgCompartmentsPerLocker" step="1" />
                <InputField label="P2P Drop Boxes" field="numDropBoxes" step="1" />
                <InputField label="Compartments/Drop Box" field="avgCompartmentsPerDropBox" step="1" />
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Financing Structure</h3>
                <div className="bg-purple-50 p-3 rounded mb-3 text-sm">
                  Choose how to fund your {fmt(initialInvestment)} investment
                </div>

                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Financing Type</label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="equity"
                        checked={inputs.financingType === 'equity'}
                        onChange={(e) => setInputs(prev => ({ ...prev, financingType: e.target.value as 'equity' | 'loan' }))}
                        className="mr-2"
                      />
                      <span className="text-sm">100% Equity</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="loan"
                        checked={inputs.financingType === 'loan'}
                        onChange={(e) => setInputs(prev => ({ ...prev, financingType: e.target.value as 'equity' | 'loan' }))}
                        className="mr-2"
                      />
                      <span className="text-sm">Debt + Equity</span>
                    </label>
                  </div>
                </div>

                {inputs.financingType === 'loan' && (
                  <div className="bg-blue-50 p-3 rounded space-y-3">
                    <InputField label="Loan Amount" field="loanAmount" prefix="$" />
                    <InputField label="Interest Rate (annual)" field="loanInterestRate" suffix="%" />
                    <InputField label="Loan Term (years)" field="loanTermYears" step="1" />
                  </div>
                )}

                {inputs.financingType === 'equity' && (
                  <div className="bg-green-50 p-3 rounded text-sm text-green-800">
                    Fully equity-financed with no debt obligations
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Rental Costs</h3>
                <div className="bg-orange-50 p-3 rounded mb-3 text-sm">Monthly rent per location</div>
                <InputField label="Rent per Locker" field="rentPerLockerMonth" prefix="$" />
                <InputField label="Rent per Drop Box" field="rentPerDropBoxMonth" prefix="$" />
                <div className="text-sm text-gray-600 mt-2 p-2 bg-gray-50 rounded">
                  <strong>Total Monthly Rent:</strong> {fmt((inputs.numLockers * inputs.rentPerLockerMonth) + (inputs.numDropBoxes * inputs.rentPerDropBoxMonth))}
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Starting Revenue</h3>
                <InputField label="Student Subscribers" field="studentSubscribers" step="1" />
                <InputField label="Yearly Sub Fee" field="yearlySubFee" prefix="$" />
                <InputField label="Deliveries/Month" field="deliveriesPerMonth" step="1" />
                <InputField label="Price/Delivery" field="pricePerDelivery" prefix="$" />
                <InputField label="P2P Transfers/Month" field="p2pTransfersPerMonth" step="1" />
                <InputField label="Price/Transfer" field="pricePerTransfer" prefix="$" />
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Growth Rates</h3>
                <div className="bg-green-50 p-3 rounded mb-3 text-sm">Monthly compound growth</div>
                <InputField label="Subscriber Growth (%/mo)" field="subscriberGrowthRate" suffix="%" />
                <InputField label="Delivery Growth (%/mo)" field="deliveryGrowthRate" suffix="%" />
                <InputField label="P2P Growth (%/mo)" field="p2pGrowthRate" suffix="%" />
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Cost Inflation</h3>
                <div className="bg-red-50 p-3 rounded mb-3 text-sm">Annual cost increases</div>
                <InputField label="Rent Inflation (%/yr)" field="rentInflationRate" suffix="%" />
                <InputField label="Salary Inflation (%/yr)" field="salaryInflationRate" suffix="%" />
                <InputField label="General Inflation (%/yr)" field="generalInflationRate" suffix="%" />
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Initial Investment</h3>
                <InputField label="Locker Cost" field="lockerCostPerUnit" prefix="$" />
                <InputField label="Install/Locker" field="installationPerLocker" prefix="$" />
                <InputField label="Drop Box Cost" field="dropBoxCostPerUnit" prefix="$" />
                <InputField label="Install/Drop Box" field="installationPerDropBox" prefix="$" />
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Operating Costs</h3>
                <InputField label="Maint/Locker" field="maintenancePerLockerMonth" prefix="$" />
                <InputField label="Maint/Drop Box" field="maintenancePerDropBoxMonth" prefix="$" />
                <InputField label="Electric/Locker" field="electricityPerLockerMonth" prefix="$" />
                <InputField label="Electric/Drop Box" field="electricityPerDropBoxMonth" prefix="$" />
                <InputField label="Software License" field="softwareLicenseMonth" prefix="$" />
                <InputField label="Insurance" field="insuranceMonth" prefix="$" />

                <div className="bg-blue-50 p-3 rounded mt-4 mb-2">
                  <div className="font-semibold mb-2">Staffing</div>
                  <InputField label="Number of Staff" field="numStaff" step="1" />
                  <InputField label="Salary/Staff" field="avgSalaryPerStaff" prefix="$" />
                  <div className="text-sm mt-2 pt-2 border-t border-blue-200">
                    <strong>Total:</strong> {fmt(inputs.numStaff * inputs.avgSalaryPerStaff)}/mo
                  </div>
                </div>

                <InputField label="Courier/Delivery" field="courierCostPerDelivery" prefix="$" />
                <InputField label="Courier/Transfer" field="courierCostPerTransfer" prefix="$" />
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Financial Analysis</h3>
                <InputField label="Discount Rate (%)" field="discountRate" suffix="%" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>5-Year Projections</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold">Year</th>
                      <th className="px-3 py-2 text-right font-semibold">Revenue</th>
                      <th className="px-3 py-2 text-right font-semibold">Costs</th>
                      <th className="px-3 py-2 text-right font-semibold">Profit</th>
                      <th className="px-3 py-2 text-right font-semibold">Margin</th>
                      <th className="px-3 py-2 text-right font-semibold">Cumulative</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projections.map((p, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-3 py-2 font-medium">{p.year === 0 ? 'Initial' : `Year ${p.year}`}</td>
                        <td className="px-3 py-2 text-right text-green-700 font-semibold">{p.year === 0 ? '-' : fmt(p.revenue || 0)}</td>
                        <td className="px-3 py-2 text-right text-red-700">{p.year === 0 ? '-' : fmt(p.costs || 0)}</td>
                        <td className="px-3 py-2 text-right font-semibold">{p.year === 0 ? fmt(-initialInvestment) : fmt(p.profit || 0)}</td>
                        <td className="px-3 py-2 text-right">{p.year === 0 ? '-' : pct(p.profitMargin || 0)}</td>
                        <td className={`px-3 py-2 text-right font-semibold ${p.cumulativeCashFlow >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                          {fmt(p.cumulativeCashFlow)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 p-4 bg-blue-50 rounded grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-600">Total 5-Yr Revenue:</span> <span className="ml-2 font-bold text-green-700">{fmt(metrics.fiveYearRev)}</span></div>
                <div><span className="text-gray-600">Total 5-Yr Profit:</span> <span className="ml-2 font-bold text-blue-700">{fmt(metrics.fiveYearProfit)}</span></div>
                <div><span className="text-gray-600">Simple ROI (5yr):</span> <span className="ml-2 font-bold text-purple-700">{pct(metrics.simpleROI)}</span></div>
                <div><span className="text-gray-600">Avg Annual Profit:</span> <span className="ml-2 font-bold text-orange-700">{fmt(metrics.avgAnnualReturn)}</span></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Year 1 Breakdown</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Revenue</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span>Subscriptions</span><span className="font-semibold text-green-700">{fmt(year1.subRevenue || 0)}</span></div>
                    <div className="flex justify-between"><span>Deliveries</span><span className="font-semibold text-green-700">{fmt(year1.deliveryRevenue || 0)}</span></div>
                    <div className="flex justify-between"><span>P2P</span><span className="font-semibold text-green-700">{fmt(year1.p2pRevenue || 0)}</span></div>
                    <div className="flex justify-between pt-2 border-t"><span className="font-semibold">Total</span><span className="font-bold text-green-700">{fmt(year1.revenue || 0)}</span></div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Costs</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span>Rent</span><span className="font-semibold text-red-700">{fmt(year1.rentCost || 0)}</span></div>
                    <div className="flex justify-between"><span>Staff</span><span className="font-semibold text-red-700">{fmt(year1.staffCost || 0)}</span></div>
                    <div className="flex justify-between"><span>Courier</span><span className="font-semibold text-red-700">{fmt(year1.courierCost || 0)}</span></div>
                    <div className="flex justify-between"><span>Other</span><span className="font-semibold text-red-700">{fmt((year1.maintenanceCost || 0) + (year1.electricityCost || 0) + (year1.fixedCost || 0))}</span></div>
                    <div className="flex justify-between pt-2 border-t"><span className="font-semibold">Total</span><span className="font-bold text-red-700">{fmt(year1.costs || 0)}</span></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>How Calculations Work</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="p-3 bg-purple-50 rounded">
                <div className="font-semibold mb-1">NPV (Net Present Value)</div>
                <div className="text-gray-700">Discounts future cash flows to today's value using the discount rate. Positive NPV means the investment creates value.</div>
                <div className="text-xs text-gray-600 mt-1">Formula: NPV = Sum [Cash Flow / (1 + r)^t] - Initial Investment</div>
              </div>
              <div className="p-3 bg-blue-50 rounded">
                <div className="font-semibold mb-1">IRR (Internal Rate of Return)</div>
                <div className="text-gray-700">The discount rate that makes NPV = 0. Higher IRR means better returns. Compare to your cost of capital.</div>
                <div className="text-xs text-gray-600 mt-1">Calculated iteratively where NPV = 0</div>
              </div>
              <div className="p-3 bg-green-50 rounded">
                <div className="font-semibold mb-1">Payback Period</div>
                <div className="text-gray-700">Time until cumulative cash flow becomes positive. Shows when you recover your initial investment.</div>
                <div className="text-xs text-gray-600 mt-1">Simple calculation based on cumulative cash flows</div>
              </div>
              <div className="p-3 bg-orange-50 rounded">
                <div className="font-semibold mb-1">Growth & Inflation</div>
                <div className="text-gray-700">Revenue grows monthly (compounded). Costs inflate annually. Rent & salaries have separate inflation rates.</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ParcelLockerModel;
