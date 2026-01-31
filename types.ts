
export enum Category {
  CARRO = 'Carro',
  CASA = 'Casa',
  PESSOAL = 'Pessoal',
  RELACAO = 'Relação',
  INVESTIMENTOS = 'Investimentos'
}

export enum FixedCategory {
  HABITACAO = 'Habitação',
  SERVICOS = 'Serviços',
  TRANSPORTE = 'Transporte',
  ASSINATURAS = 'Assinaturas',
  OUTROS = 'Outros'
}

export enum Priority {
  ALTA = 'Alta',
  MEDIA = 'Média',
  BAIXA = 'Baixa'
}

export enum Status {
  PLANEADA = 'Planeada',
  EM_EXECUCAO = 'Em execução',
  CONCLUIDA = 'Concluída'
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Account {
  id: string;
  name: string;
  currency: 'Kz' | 'EUR';
  balance: number;
}

export interface FixedExpense {
  id: string;
  name: string;
  value: number;
  category: FixedCategory;
  active: boolean;
}

export interface FinancialActivity {
  id: string;
  name: string;
  category: Category;
  subcategory: string;
  costEstimate: number;
  plannedMonth: string; // YYYY-MM
  priority: Priority;
  status: Status;
  observations: string;
}

export interface SavingsLog {
  id: string;
  month: string; // YYYY-MM
  amountPoured: number;
  currency: 'Kz' | 'EUR';
  allocatedToEmergency: number;
  targetAccountId: string; // Conta principal ou conta da reserva
  surplusAccountId?: string; // Conta para o excedente (se houver split)
}

export interface AppSettings {
  monthlySalary: number;
  mandatorySavings: number;
  savingsPercentageRule: number;
  emergencyFundTarget: number;
  monthlyBudgetLimit: number;
  fixedExpensesLimit: number;
  highCostThreshold: number;
  initialEurBalance: number;
}

export interface AppState {
  user: User | null;
  accounts: Account[];
  fixedExpenses: FixedExpense[];
  activities: FinancialActivity[];
  savings: SavingsLog[];
  emergencyFundCurrent: number;
  settings: AppSettings;
}
