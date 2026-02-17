
export enum Category {
  CARRO = 'Carro',
  CASA = 'Casa',
  PESSOAL = 'Pessoal',
  RELACAO = 'Relação',
  INVESTIMENTOS = 'Investimentos',
  SAUDE = 'Saúde',
  LAZER = 'Lazer',
  ALIMENTACAO = 'Alimentação',
  SALARIO = 'Salário',
  OUTROS = 'Outros'
}

export enum TransactionType {
  INCOME = 'Receita',
  EXPENSE = 'Despesa',
  TRANSFER = 'Transferência',
  ADJUSTMENT = 'Reajuste'
}

export enum Priority {
  ALTA = 'Alta',
  MEDIA = 'Média',
  BAIXA = 'Baixa'
}

export enum Status {
  PENDENTE = 'Pendente',
  CONCLUIDA = 'Concluída',
  PLANEADA = 'Planeada'
}

export enum FixedCategory {
  CASA = 'Casa',
  SERVICOS = 'Serviços',
  ASSINATURAS = 'Assinaturas',
  EDUCAO = 'Educação',
  SAUDE = 'Saúde',
  OUTROS = 'Outros'
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
  costEstimate: number;
  plannedMonth: string;
  priority: Priority;
  status: Status;
  accountId?: string; // Conta vinculada à atividade
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  type: TransactionType;
  category: Category;
  accountId: string;
  toAccountId?: string;
  status: Status;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: Category;
  color: string;
  accountId?: string; // Conta onde o dinheiro da meta está guardado
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
  includeInTotal: boolean;
  isSavingsAccount: boolean;
  color?: string;
}

export interface SavingRecord {
  id: string;
  month: string;
  amountPoured: number;
  currency: 'Kz' | 'EUR';
}

export interface AppSettings {
  monthlySalary: number;
  mandatorySavings: number;
  savingsPercentageRule: number;
  emergencyFundTarget: number;
  monthlyBudgetLimit: number;
  fixedExpensesLimit: number;
}

export interface AppState {
  user: User | null;
  accounts: Account[];
  activities: FinancialActivity[];
  goals: Goal[];
  transactions: Transaction[];
  fixedExpenses: FixedExpense[];
  savings: SavingRecord[];
  emergencyFundCurrent: number;
  savingsAccountId?: string;
  settings: AppSettings;
}
