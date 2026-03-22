--
-- PostgreSQL database dump
--

\restrict Ofa69C4W3HRe7xKUpEfjLqhY4HfZnI8ApLxjHn1kbRXMMXKwiXwLLKpAE8tGoEu

-- Dumped from database version 17.8 (a284a84)
-- Dumped by pg_dump version 17.6 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: AccountType; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."AccountType" AS ENUM (
    'ASSET',
    'LIABILITY',
    'EQUITY',
    'REVENUE',
    'EXPENSE'
);


ALTER TYPE public."AccountType" OWNER TO neondb_owner;

--
-- Name: ActivityType; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."ActivityType" AS ENUM (
    'LOGIN',
    'LOGOUT',
    'CREATE',
    'UPDATE',
    'DELETE',
    'VIEW',
    'EXPORT',
    'PRINT',
    'OTHER'
);


ALTER TYPE public."ActivityType" OWNER TO neondb_owner;

--
-- Name: AdjustmentStatus; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."AdjustmentStatus" AS ENUM (
    'DRAFT',
    'POSTED',
    'CANCELLED'
);


ALTER TYPE public."AdjustmentStatus" OWNER TO neondb_owner;

--
-- Name: ApplyTo; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."ApplyTo" AS ENUM (
    'SALES',
    'PURCHASES',
    'BOTH'
);


ALTER TYPE public."ApplyTo" OWNER TO neondb_owner;

--
-- Name: AssetStatus; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."AssetStatus" AS ENUM (
    'ACTIVE',
    'IN_REPAIR',
    'IN_STORAGE',
    'DISPOSED',
    'SOLD'
);


ALTER TYPE public."AssetStatus" OWNER TO neondb_owner;

--
-- Name: AssignmentStatus; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."AssignmentStatus" AS ENUM (
    'PENDING',
    'IN_PROGRESS',
    'COMPLETED'
);


ALTER TYPE public."AssignmentStatus" OWNER TO neondb_owner;

--
-- Name: BankAccountType; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."BankAccountType" AS ENUM (
    'CHECKING',
    'SAVINGS',
    'CASH',
    'CREDIT'
);


ALTER TYPE public."BankAccountType" OWNER TO neondb_owner;

--
-- Name: BankStatus; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."BankStatus" AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'CLOSED'
);


ALTER TYPE public."BankStatus" OWNER TO neondb_owner;

--
-- Name: CategoryType; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."CategoryType" AS ENUM (
    'PRODUCT',
    'EXPENSE',
    'SERVICE'
);


ALTER TYPE public."CategoryType" OWNER TO neondb_owner;

--
-- Name: CheckStatus; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."CheckStatus" AS ENUM (
    'PENDING',
    'DEPOSITED',
    'CLEARED',
    'RETURNED',
    'CANCELLED'
);


ALTER TYPE public."CheckStatus" OWNER TO neondb_owner;

--
-- Name: CheckType; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."CheckType" AS ENUM (
    'ISSUED',
    'RECEIVED'
);


ALTER TYPE public."CheckType" OWNER TO neondb_owner;

--
-- Name: ClosureStatus; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."ClosureStatus" AS ENUM (
    'OPEN',
    'CLOSED'
);


ALTER TYPE public."ClosureStatus" OWNER TO neondb_owner;

--
-- Name: ContactType; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."ContactType" AS ENUM (
    'CLIENT',
    'PROVIDER',
    'BOTH'
);


ALTER TYPE public."ContactType" OWNER TO neondb_owner;

--
-- Name: CostMethod; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."CostMethod" AS ENUM (
    'FIFO',
    'AVERAGE',
    'LIFO'
);


ALTER TYPE public."CostMethod" OWNER TO neondb_owner;

--
-- Name: DepreciationMethod; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."DepreciationMethod" AS ENUM (
    'STRAIGHT_LINE',
    'SUM_OF_YEARS_DIGITS',
    'DECLINING_BALANCE'
);


ALTER TYPE public."DepreciationMethod" OWNER TO neondb_owner;

--
-- Name: EstimateStatus; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."EstimateStatus" AS ENUM (
    'DRAFT',
    'SENT',
    'ACCEPTED',
    'REJECTED',
    'EXPIRED'
);


ALTER TYPE public."EstimateStatus" OWNER TO neondb_owner;

--
-- Name: ExpenseStatus; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."ExpenseStatus" AS ENUM (
    'PENDING',
    'PAID',
    'CANCELLED'
);


ALTER TYPE public."ExpenseStatus" OWNER TO neondb_owner;

--
-- Name: ExpenseType; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."ExpenseType" AS ENUM (
    'EXPENSE',
    'PURCHASE'
);


ALTER TYPE public."ExpenseType" OWNER TO neondb_owner;

--
-- Name: ImportStatus; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."ImportStatus" AS ENUM (
    'PENDING',
    'PROCESSING',
    'COMPLETED',
    'FAILED'
);


ALTER TYPE public."ImportStatus" OWNER TO neondb_owner;

--
-- Name: IncomeStatus; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."IncomeStatus" AS ENUM (
    'PENDING',
    'RECEIVED',
    'CANCELLED'
);


ALTER TYPE public."IncomeStatus" OWNER TO neondb_owner;

--
-- Name: InvoiceStatus; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."InvoiceStatus" AS ENUM (
    'DRAFT',
    'SENT',
    'PAID',
    'CANCELLED',
    'PARTIAL'
);


ALTER TYPE public."InvoiceStatus" OWNER TO neondb_owner;

--
-- Name: JournalStatus; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."JournalStatus" AS ENUM (
    'DRAFT',
    'POSTED',
    'CANCELLED'
);


ALTER TYPE public."JournalStatus" OWNER TO neondb_owner;

--
-- Name: MovementType; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."MovementType" AS ENUM (
    'PURCHASE',
    'SALE',
    'ADJUSTMENT_IN',
    'ADJUSTMENT_OUT',
    'RETURN_IN',
    'RETURN_OUT',
    'TRANSFER_IN',
    'TRANSFER_OUT'
);


ALTER TYPE public."MovementType" OWNER TO neondb_owner;

--
-- Name: NotificationPriority; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."NotificationPriority" AS ENUM (
    'LOW',
    'NORMAL',
    'HIGH',
    'URGENT'
);


ALTER TYPE public."NotificationPriority" OWNER TO neondb_owner;

--
-- Name: NotificationType; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."NotificationType" AS ENUM (
    'WORK_ORDER_CREATED',
    'WORK_ORDER_STATUS_CHANGED',
    'WORK_ORDER_ASSIGNED',
    'INVOICE_CREATED',
    'INVOICE_PAID',
    'PAYMENT_RECEIVED',
    'LOW_STOCK_ALERT',
    'DUE_DATE_REMINDER',
    'SYSTEM_MESSAGE',
    'USER_ASSIGNED'
);


ALTER TYPE public."NotificationType" OWNER TO neondb_owner;

--
-- Name: POSPrintFormat; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."POSPrintFormat" AS ENUM (
    'TICKET',
    'HALF_LETTER',
    'LETTER'
);


ALTER TYPE public."POSPrintFormat" OWNER TO neondb_owner;

--
-- Name: POSType; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."POSType" AS ENUM (
    'STANDARD',
    'SPLIT'
);


ALTER TYPE public."POSType" OWNER TO neondb_owner;

--
-- Name: PaymentMethod; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."PaymentMethod" AS ENUM (
    'CASH',
    'BANK_TRANSFER',
    'CREDIT_CARD',
    'OTHER'
);


ALTER TYPE public."PaymentMethod" OWNER TO neondb_owner;

--
-- Name: ProductType; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."ProductType" AS ENUM (
    'FINISHED',
    'SEMI_FINISHED',
    'RAW',
    'CONFIGURABLE'
);


ALTER TYPE public."ProductType" OWNER TO neondb_owner;

--
-- Name: ProductionOrderStatus; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."ProductionOrderStatus" AS ENUM (
    'DRAFT',
    'CONFIRMED',
    'IN_PROGRESS',
    'DONE',
    'CANCELLED'
);


ALTER TYPE public."ProductionOrderStatus" OWNER TO neondb_owner;

--
-- Name: ReconciliationStatus; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."ReconciliationStatus" AS ENUM (
    'DRAFT',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED'
);


ALTER TYPE public."ReconciliationStatus" OWNER TO neondb_owner;

--
-- Name: RetentionType; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."RetentionType" AS ENUM (
    'ISR_RETENTION',
    'IVA_RETENTION',
    'ISC_RETENTION',
    'FLETE_RETENTION',
    'ICA_RETENTION',
    'RENTA_RETENTION',
    'NOTARY_RETENTION'
);


ALTER TYPE public."RetentionType" OWNER TO neondb_owner;

--
-- Name: ShiftStatus; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."ShiftStatus" AS ENUM (
    'OPEN',
    'CLOSED',
    'AUDITED'
);


ALTER TYPE public."ShiftStatus" OWNER TO neondb_owner;

--
-- Name: SubscriptionPlan; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."SubscriptionPlan" AS ENUM (
    'FREE',
    'PRO',
    'ENTERPRISE'
);


ALTER TYPE public."SubscriptionPlan" OWNER TO neondb_owner;

--
-- Name: SystemRole; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."SystemRole" AS ENUM (
    'ADMIN',
    'CONTADOR',
    'VENDEDOR',
    'USER'
);


ALTER TYPE public."SystemRole" OWNER TO neondb_owner;

--
-- Name: TransactionType; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."TransactionType" AS ENUM (
    'INCOME',
    'EXPENSE',
    'TRANSFER'
);


ALTER TYPE public."TransactionType" OWNER TO neondb_owner;

--
-- Name: WorkOrderStatus; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."WorkOrderStatus" AS ENUM (
    'RECEIVED',
    'DIAGNOSIS',
    'APPROVED',
    'IN_PROGRESS',
    'FINISHED',
    'DELIVERED',
    'CANCELLED'
);


ALTER TYPE public."WorkOrderStatus" OWNER TO neondb_owner;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Account; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Account" (
    id text NOT NULL,
    "userId" text NOT NULL,
    type text NOT NULL,
    provider text NOT NULL,
    "providerAccountId" text NOT NULL,
    refresh_token text,
    access_token text,
    expires_at integer,
    token_type text,
    scope text,
    id_token text,
    session_state text
);


ALTER TABLE public."Account" OWNER TO neondb_owner;

--
-- Name: AccountingAccount; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."AccountingAccount" (
    id text NOT NULL,
    "organizationId" text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    type public."AccountType" NOT NULL,
    "parentId" text,
    "isActive" boolean DEFAULT true NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."AccountingAccount" OWNER TO neondb_owner;

--
-- Name: ActivityLog; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."ActivityLog" (
    id text NOT NULL,
    "organizationId" text NOT NULL,
    "userId" text NOT NULL,
    type public."ActivityType" NOT NULL,
    action text NOT NULL,
    description text NOT NULL,
    module text,
    "entityType" text,
    "entityId" text,
    "oldValues" text,
    "newValues" text,
    "ipAddress" text,
    "userAgent" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ActivityLog" OWNER TO neondb_owner;

--
-- Name: AssetCategory; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."AssetCategory" (
    id text NOT NULL,
    "organizationId" text NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    "depreciationMethod" public."DepreciationMethod" DEFAULT 'STRAIGHT_LINE'::public."DepreciationMethod" NOT NULL,
    "usefulLifeYears" integer DEFAULT 5 NOT NULL,
    "depreciationRate" numeric(5,2) DEFAULT 20 NOT NULL,
    "accountAssetId" text,
    "accountDepreciationId" text,
    "accountExpenseId" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."AssetCategory" OWNER TO neondb_owner;

--
-- Name: AssetDepreciation; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."AssetDepreciation" (
    id text NOT NULL,
    "organizationId" text NOT NULL,
    "assetId" text NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    period text NOT NULL,
    amount numeric(16,2) NOT NULL,
    accumulated numeric(16,2) NOT NULL,
    "journalEntryId" text,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."AssetDepreciation" OWNER TO neondb_owner;

--
-- Name: BankAccount; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."BankAccount" (
    id text NOT NULL,
    "organizationId" text NOT NULL,
    name text NOT NULL,
    "bankName" text NOT NULL,
    "accountNumber" text NOT NULL,
    "accountType" public."BankAccountType" DEFAULT 'CHECKING'::public."BankAccountType" NOT NULL,
    currency text DEFAULT 'DOP'::text NOT NULL,
    "initialBalance" numeric(16,2) DEFAULT 0 NOT NULL,
    "currentBalance" numeric(16,2) DEFAULT 0 NOT NULL,
    status public."BankStatus" DEFAULT 'ACTIVE'::public."BankStatus" NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."BankAccount" OWNER TO neondb_owner;

--
-- Name: BankReconciliation; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."BankReconciliation" (
    id text NOT NULL,
    "organizationId" text NOT NULL,
    "bankAccountId" text NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    "initialBalance" numeric(16,2) NOT NULL,
    "finalBalance" numeric(16,2) NOT NULL,
    "statementTotal" numeric(16,2) NOT NULL,
    "systemTotal" numeric(16,2) NOT NULL,
    difference numeric(16,2) NOT NULL,
    status public."ReconciliationStatus" DEFAULT 'DRAFT'::public."ReconciliationStatus" NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."BankReconciliation" OWNER TO neondb_owner;

--
-- Name: BankStatementImport; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."BankStatementImport" (
    id text NOT NULL,
    "organizationId" text NOT NULL,
    "bankAccountId" text NOT NULL,
    filename text NOT NULL,
    "fileSize" integer,
    "importDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    transactions integer DEFAULT 0 NOT NULL,
    status public."ImportStatus" DEFAULT 'PENDING'::public."ImportStatus" NOT NULL,
    "errorMessage" text,
    "previewData" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."BankStatementImport" OWNER TO neondb_owner;

--
-- Name: BillOfMaterials; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."BillOfMaterials" (
    id text NOT NULL,
    "organizationId" text NOT NULL,
    "productId" text NOT NULL,
    version text DEFAULT '1.0'::text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "isDefault" boolean DEFAULT false NOT NULL,
    "variantMatch" text,
    "totalCost" numeric(16,2) DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."BillOfMaterials" OWNER TO neondb_owner;

--
-- Name: BoMItem; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."BoMItem" (
    id text NOT NULL,
    "bomId" text NOT NULL,
    "componentId" text NOT NULL,
    quantity numeric(16,4) DEFAULT 1 NOT NULL,
    "quantityFormula" text,
    "isOptional" boolean DEFAULT false NOT NULL,
    "scrapPercent" numeric(5,2) DEFAULT 0 NOT NULL,
    "applyToVariants" text,
    sequence integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."BoMItem" OWNER TO neondb_owner;

--
-- Name: CashClosure; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."CashClosure" (
    id text NOT NULL,
    "organizationId" text NOT NULL,
    "userId" text NOT NULL,
    "shiftId" text,
    "openingAmount" numeric(16,2) NOT NULL,
    "closingAmount" numeric(16,2) DEFAULT 0 NOT NULL,
    "totalCash" numeric(16,2) DEFAULT 0 NOT NULL,
    "totalCard" numeric(16,2) DEFAULT 0 NOT NULL,
    "totalTransfer" numeric(16,2) DEFAULT 0 NOT NULL,
    "totalOther" numeric(16,2) DEFAULT 0 NOT NULL,
    "countedCash" numeric(16,2),
    difference numeric(16,2) DEFAULT 0 NOT NULL,
    "totalSales" integer DEFAULT 0 NOT NULL,
    "totalRefunds" integer DEFAULT 0 NOT NULL,
    "totalAmount" numeric(16,2) DEFAULT 0 NOT NULL,
    notes text,
    status public."ClosureStatus" DEFAULT 'OPEN'::public."ClosureStatus" NOT NULL,
    "openedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "closedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."CashClosure" OWNER TO neondb_owner;

--
-- Name: CashDrawerShift; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."CashDrawerShift" (
    id text NOT NULL,
    "organizationId" text NOT NULL,
    "userId" text NOT NULL,
    status public."ShiftStatus" DEFAULT 'OPEN'::public."ShiftStatus" NOT NULL,
    "openingDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "closingDate" timestamp(3) without time zone,
    "openingAmount" numeric(16,2) DEFAULT 0 NOT NULL,
    "expectedAmount" numeric(16,2),
    "actualAmount" numeric(16,2),
    "openingNotes" text,
    "closingNotes" text,
    "totalCashSales" numeric(16,2) DEFAULT 0 NOT NULL,
    "totalCardSales" numeric(16,2) DEFAULT 0 NOT NULL,
    "totalTransferSales" numeric(16,2) DEFAULT 0 NOT NULL,
    "totalSales" numeric(16,2) DEFAULT 0 NOT NULL,
    "totalPayments" numeric(16,2) DEFAULT 0 NOT NULL,
    "totalChangeGiven" numeric(16,2) DEFAULT 0 NOT NULL,
    "transactionCount" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."CashDrawerShift" OWNER TO neondb_owner;

--
-- Name: Category; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Category" (
    id text NOT NULL,
    "organizationId" text NOT NULL,
    name text NOT NULL,
    description text,
    type public."CategoryType" DEFAULT 'PRODUCT'::public."CategoryType" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Category" OWNER TO neondb_owner;

--
-- Name: Check; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Check" (
    id text NOT NULL,
    "organizationId" text NOT NULL,
    "bankAccountId" text NOT NULL,
    number text NOT NULL,
    type public."CheckType" NOT NULL,
    date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dueDate" timestamp(3) without time zone,
    amount numeric(16,2) NOT NULL,
    beneficiary text NOT NULL,
    status public."CheckStatus" DEFAULT 'PENDING'::public."CheckStatus" NOT NULL,
    notes text,
    "expenseId" text,
    "incomeId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Check" OWNER TO neondb_owner;

--
-- Name: Client; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Client" (
    id text NOT NULL,
    "organizationId" text NOT NULL,
    name text NOT NULL,
    email text,
    phone text,
    address text,
    "idNumber" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    type public."ContactType" DEFAULT 'CLIENT'::public."ContactType" NOT NULL
);


ALTER TABLE public."Client" OWNER TO neondb_owner;

--
-- Name: ClientFiscalData; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."ClientFiscalData" (
    id text NOT NULL,
    "clientId" text NOT NULL,
    "taxId" text,
    "fiscalRegime" text,
    "contributorType" text,
    "addressFiscal" text,
    "phoneFiscal" text,
    "emailBilling" text,
    "dgiiStatus" text,
    "agentRetention" boolean DEFAULT false NOT NULL,
    "agentPerception" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ClientFiscalData" OWNER TO neondb_owner;

--
-- Name: CostCenter; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."CostCenter" (
    id text NOT NULL,
    "organizationId" text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    description text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."CostCenter" OWNER TO neondb_owner;

--
-- Name: Estimate; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Estimate" (
    id text NOT NULL,
    "organizationId" text NOT NULL,
    number text NOT NULL,
    date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dueDate" timestamp(3) without time zone,
    "clientId" text NOT NULL,
    subtotal numeric(16,2) NOT NULL,
    tax numeric(16,2) NOT NULL,
    total numeric(16,2) NOT NULL,
    status public."EstimateStatus" DEFAULT 'DRAFT'::public."EstimateStatus" NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Estimate" OWNER TO neondb_owner;

--
-- Name: EstimateItem; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."EstimateItem" (
    id text NOT NULL,
    "estimateId" text NOT NULL,
    "productId" text,
    description text,
    quantity integer NOT NULL,
    price numeric(16,2) NOT NULL,
    total numeric(16,2) NOT NULL
);


ALTER TABLE public."EstimateItem" OWNER TO neondb_owner;

--
-- Name: ExchangeRateAdjustment; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."ExchangeRateAdjustment" (
    id text NOT NULL,
    "organizationId" text NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    period text NOT NULL,
    "totalDebit" numeric(16,2) NOT NULL,
    "totalCredit" numeric(16,2) NOT NULL,
    difference numeric(16,2) NOT NULL,
    "journalEntryId" text,
    status public."AdjustmentStatus" DEFAULT 'DRAFT'::public."AdjustmentStatus" NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ExchangeRateAdjustment" OWNER TO neondb_owner;

--
-- Name: Expense; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Expense" (
    id text NOT NULL,
    "organizationId" text NOT NULL,
    number text NOT NULL,
    date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    provider text NOT NULL,
    description text,
    "categoryId" text NOT NULL,
    total numeric(16,2) NOT NULL,
    status public."ExpenseStatus" DEFAULT 'PENDING'::public."ExpenseStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "journalEntryId" text,
    type public."ExpenseType" DEFAULT 'EXPENSE'::public."ExpenseType" NOT NULL,
    "costCenterId" text
);


ALTER TABLE public."Expense" OWNER TO neondb_owner;

--
-- Name: ExpenseItem; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."ExpenseItem" (
    id text NOT NULL,
    "expenseId" text NOT NULL,
    "productId" text,
    description text,
    quantity integer NOT NULL,
    price numeric(16,2) NOT NULL,
    total numeric(16,2) NOT NULL
);


ALTER TABLE public."ExpenseItem" OWNER TO neondb_owner;

--
-- Name: FixedAsset; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."FixedAsset" (
    id text NOT NULL,
    "organizationId" text NOT NULL,
    "categoryId" text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    description text,
    location text,
    "responsibleId" text,
    "acquisitionDate" timestamp(3) without time zone NOT NULL,
    "acquisitionCost" numeric(16,2) NOT NULL,
    "salvageValue" numeric(16,2) DEFAULT 0 NOT NULL,
    "usefulLifeYears" integer,
    "depreciationMethod" public."DepreciationMethod" DEFAULT 'STRAIGHT_LINE'::public."DepreciationMethod" NOT NULL,
    "depreciationStartDate" timestamp(3) without time zone,
    status public."AssetStatus" DEFAULT 'ACTIVE'::public."AssetStatus" NOT NULL,
    "invoiceId" text,
    notes text,
    "currentValue" numeric(16,2) DEFAULT 0 NOT NULL,
    "accumulatedDepreciation" numeric(16,2) DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."FixedAsset" OWNER TO neondb_owner;

--
-- Name: Income; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Income" (
    id text NOT NULL,
    "organizationId" text NOT NULL,
    number text NOT NULL,
    date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    description text,
    "clientId" text,
    "categoryId" text,
    amount numeric(16,2) NOT NULL,
    "paymentMethod" text,
    reference text,
    status public."IncomeStatus" DEFAULT 'RECEIVED'::public."IncomeStatus" NOT NULL,
    "bankAccountId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "costCenterId" text
);


ALTER TABLE public."Income" OWNER TO neondb_owner;

--
-- Name: InventoryMovement; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."InventoryMovement" (
    id text NOT NULL,
    "organizationId" text NOT NULL,
    "productId" text NOT NULL,
    type public."MovementType" NOT NULL,
    quantity integer NOT NULL,
    "unitCost" numeric(16,2) NOT NULL,
    "totalCost" numeric(16,2) NOT NULL,
    reference text,
    "sourceType" text,
    "sourceId" text,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."InventoryMovement" OWNER TO neondb_owner;

--
-- Name: InventoryWarehouse; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."InventoryWarehouse" (
    id text NOT NULL,
    "productId" text NOT NULL,
    "warehouseId" text NOT NULL,
    quantity integer DEFAULT 0 NOT NULL
);


ALTER TABLE public."InventoryWarehouse" OWNER TO neondb_owner;

--
-- Name: Invoice; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Invoice" (
    id text NOT NULL,
    "organizationId" text NOT NULL,
    number text NOT NULL,
    date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dueDate" timestamp(3) without time zone,
    "clientId" text NOT NULL,
    subtotal numeric(16,2) NOT NULL,
    tax numeric(16,2) NOT NULL,
    total numeric(16,2) NOT NULL,
    status public."InvoiceStatus" DEFAULT 'DRAFT'::public."InvoiceStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "journalEntryId" text,
    "costCenterId" text
);


ALTER TABLE public."Invoice" OWNER TO neondb_owner;

--
-- Name: InvoiceItem; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."InvoiceItem" (
    id text NOT NULL,
    "invoiceId" text NOT NULL,
    "productId" text,
    quantity integer NOT NULL,
    price numeric(16,2) NOT NULL,
    total numeric(16,2) NOT NULL,
    description text,
    tax numeric(16,2) DEFAULT 0 NOT NULL
);


ALTER TABLE public."InvoiceItem" OWNER TO neondb_owner;

--
-- Name: JournalEntry; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."JournalEntry" (
    id text NOT NULL,
    "organizationId" text NOT NULL,
    date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    description text NOT NULL,
    "sourceType" text,
    "sourceId" text,
    reference text,
    status public."JournalStatus" DEFAULT 'POSTED'::public."JournalStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."JournalEntry" OWNER TO neondb_owner;

--
-- Name: JournalLine; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."JournalLine" (
    id text NOT NULL,
    "entryId" text NOT NULL,
    "accountId" text NOT NULL,
    debit numeric(16,2) DEFAULT 0 NOT NULL,
    credit numeric(16,2) DEFAULT 0 NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."JournalLine" OWNER TO neondb_owner;

--
-- Name: Membership; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Membership" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "organizationId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "roleId" text,
    "systemRole" public."SystemRole" DEFAULT 'USER'::public."SystemRole" NOT NULL
);


ALTER TABLE public."Membership" OWNER TO neondb_owner;

--
-- Name: Notification; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Notification" (
    id text NOT NULL,
    "organizationId" text NOT NULL,
    "userId" text,
    type public."NotificationType" NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    link text,
    "entityType" text,
    "entityId" text,
    "isRead" boolean DEFAULT false NOT NULL,
    "readAt" timestamp(3) without time zone,
    priority public."NotificationPriority" DEFAULT 'NORMAL'::public."NotificationPriority" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Notification" OWNER TO neondb_owner;

--
-- Name: Organization; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Organization" (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    plan public."SubscriptionPlan" DEFAULT 'FREE'::public."SubscriptionPlan" NOT NULL
);


ALTER TABLE public."Organization" OWNER TO neondb_owner;

--
-- Name: POSConfig; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."POSConfig" (
    id text NOT NULL,
    "organizationId" text NOT NULL,
    "posType" public."POSType" DEFAULT 'STANDARD'::public."POSType" NOT NULL,
    "printFormat" public."POSPrintFormat" DEFAULT 'TICKET'::public."POSPrintFormat" NOT NULL,
    "printCopies" integer DEFAULT 1 NOT NULL,
    "autoPrint" boolean DEFAULT false NOT NULL,
    "showLogo" boolean DEFAULT true NOT NULL,
    "defaultClientId" text,
    "defaultTaxRate" numeric(5,2) DEFAULT 18 NOT NULL,
    "taxIncluded" boolean DEFAULT true NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."POSConfig" OWNER TO neondb_owner;

--
-- Name: Payment; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Payment" (
    id text NOT NULL,
    amount numeric(16,2) NOT NULL,
    date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    method public."PaymentMethod" DEFAULT 'CASH'::public."PaymentMethod" NOT NULL,
    "invoiceId" text,
    "expenseId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    reference text,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "shiftId" text
);


ALTER TABLE public."Payment" OWNER TO neondb_owner;

--
-- Name: Product; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Product" (
    id text NOT NULL,
    "organizationId" text NOT NULL,
    name text NOT NULL,
    description text,
    price numeric(16,2) NOT NULL,
    stock integer DEFAULT 0 NOT NULL,
    sku text,
    "categoryId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    cost numeric(16,2) DEFAULT 0 NOT NULL,
    "costMethod" public."CostMethod" DEFAULT 'AVERAGE'::public."CostMethod" NOT NULL,
    "minStock" integer DEFAULT 0 NOT NULL,
    "attributeTemplateId" text,
    "hasAttributes" boolean DEFAULT false NOT NULL,
    "productType" public."ProductType" DEFAULT 'FINISHED'::public."ProductType" NOT NULL
);


ALTER TABLE public."Product" OWNER TO neondb_owner;

--
-- Name: ProductAlert; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."ProductAlert" (
    id text NOT NULL,
    "productId" text NOT NULL,
    "warehouseId" text,
    "minQuantity" integer DEFAULT 5 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ProductAlert" OWNER TO neondb_owner;

--
-- Name: ProductAttribute; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."ProductAttribute" (
    id text NOT NULL,
    "organizationId" text NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    type text NOT NULL,
    unit text,
    "defaultValue" text,
    options text,
    "isRequired" boolean DEFAULT false NOT NULL,
    "isGlobal" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ProductAttribute" OWNER TO neondb_owner;

--
-- Name: ProductAttributeValue; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."ProductAttributeValue" (
    id text NOT NULL,
    "productId" text NOT NULL,
    "attributeId" text NOT NULL,
    value text NOT NULL
);


ALTER TABLE public."ProductAttributeValue" OWNER TO neondb_owner;

--
-- Name: ProductionConsumption; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."ProductionConsumption" (
    id text NOT NULL,
    "productionOrderId" text NOT NULL,
    "componentId" text NOT NULL,
    "quantityRequired" numeric(16,4) NOT NULL,
    "quantityConsumed" numeric(16,4) DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ProductionConsumption" OWNER TO neondb_owner;

--
-- Name: ProductionOrder; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."ProductionOrder" (
    id text NOT NULL,
    "organizationId" text NOT NULL,
    number text NOT NULL,
    "productId" text NOT NULL,
    quantity numeric(16,4) NOT NULL,
    attributes text,
    status public."ProductionOrderStatus" DEFAULT 'DRAFT'::public."ProductionOrderStatus" NOT NULL,
    "totalCost" numeric(16,2) DEFAULT 0 NOT NULL,
    "plannedDate" timestamp(3) without time zone,
    "startDate" timestamp(3) without time zone,
    "endDate" timestamp(3) without time zone,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ProductionOrder" OWNER TO neondb_owner;

--
-- Name: ReconciliationItem; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."ReconciliationItem" (
    id text NOT NULL,
    "reconciliationId" text NOT NULL,
    "transactionId" text,
    "transactionType" public."TransactionType",
    description text NOT NULL,
    reference text,
    "statementDate" timestamp(3) without time zone NOT NULL,
    "statementAmount" numeric(16,2) NOT NULL,
    "systemAmount" numeric(16,2),
    matched boolean DEFAULT false NOT NULL,
    "matchDate" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ReconciliationItem" OWNER TO neondb_owner;

--
-- Name: Retention; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Retention" (
    id text NOT NULL,
    "organizationId" text NOT NULL,
    name text NOT NULL,
    type public."RetentionType" NOT NULL,
    percentage numeric(5,2) NOT NULL,
    description text,
    "accountPayableId" text,
    "accountReceivableId" text,
    "appliesTo" public."ApplyTo" NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Retention" OWNER TO neondb_owner;

--
-- Name: RetentionCertificate; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."RetentionCertificate" (
    id text NOT NULL,
    "organizationId" text NOT NULL,
    "retentionId" text NOT NULL,
    "certificateNumber" text NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    "agentName" text NOT NULL,
    "agentTaxId" text NOT NULL,
    "agentAddress" text NOT NULL,
    "beneficiaryName" text NOT NULL,
    "beneficiaryTaxId" text NOT NULL,
    "beneficiaryAddress" text NOT NULL,
    "totalAmount" numeric(16,2) NOT NULL,
    "retainedAmount" numeric(16,2) NOT NULL,
    concept text NOT NULL,
    period text NOT NULL,
    "journalEntryId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."RetentionCertificate" OWNER TO neondb_owner;

--
-- Name: Role; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Role" (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    permissions text[],
    "organizationId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Role" OWNER TO neondb_owner;

--
-- Name: Session; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Session" (
    id text NOT NULL,
    "sessionToken" text NOT NULL,
    "userId" text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Session" OWNER TO neondb_owner;

--
-- Name: User; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."User" (
    id text NOT NULL,
    name text,
    email text,
    "emailVerified" timestamp(3) without time zone,
    image text,
    password text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    role public."SystemRole" DEFAULT 'USER'::public."SystemRole" NOT NULL
);


ALTER TABLE public."User" OWNER TO neondb_owner;

--
-- Name: Vehicle; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Vehicle" (
    id text NOT NULL,
    "organizationId" text NOT NULL,
    "clientId" text NOT NULL,
    brand text NOT NULL,
    model text NOT NULL,
    year integer,
    color text,
    plates text,
    vin text,
    mileage integer DEFAULT 0,
    "cameWithTow" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Vehicle" OWNER TO neondb_owner;

--
-- Name: VerificationToken; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."VerificationToken" (
    identifier text NOT NULL,
    token text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."VerificationToken" OWNER TO neondb_owner;

--
-- Name: Warehouse; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Warehouse" (
    id text NOT NULL,
    "organizationId" text NOT NULL,
    name text NOT NULL,
    address text,
    "isDefault" boolean DEFAULT false NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Warehouse" OWNER TO neondb_owner;

--
-- Name: WorkOrder; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."WorkOrder" (
    id text NOT NULL,
    "organizationId" text NOT NULL,
    "vehicleId" text NOT NULL,
    "clientId" text NOT NULL,
    number text NOT NULL,
    "entryDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "exitDate" timestamp(3) without time zone,
    "fuelLevel" integer DEFAULT 50 NOT NULL,
    "cameWithTow" boolean DEFAULT false NOT NULL,
    description text,
    "workItems" text,
    inventory text,
    "preExistingDamage" text,
    notes text,
    "invoiceId" text,
    "createdById" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    status public."WorkOrderStatus" DEFAULT 'RECEIVED'::public."WorkOrderStatus" NOT NULL,
    "mechanicId" text,
    "assignedAt" timestamp(3) without time zone,
    "startedAt" timestamp(3) without time zone,
    "completedAt" timestamp(3) without time zone,
    "deliveredAt" timestamp(3) without time zone
);


ALTER TABLE public."WorkOrder" OWNER TO neondb_owner;

--
-- Name: WorkOrderAssignment; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."WorkOrderAssignment" (
    id text NOT NULL,
    "workOrderId" text NOT NULL,
    "userId" text NOT NULL,
    task text NOT NULL,
    "estimatedHours" numeric(5,2),
    "actualHours" numeric(5,2),
    status public."AssignmentStatus" DEFAULT 'PENDING'::public."AssignmentStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."WorkOrderAssignment" OWNER TO neondb_owner;

--
-- Data for Name: Account; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Account" (id, "userId", type, provider, "providerAccountId", refresh_token, access_token, expires_at, token_type, scope, id_token, session_state) FROM stdin;
\.


--
-- Data for Name: AccountingAccount; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."AccountingAccount" (id, "organizationId", code, name, type, "parentId", "isActive", description, "createdAt", "updatedAt") FROM stdin;
cmmmn3gjd0001rg9k2eh6tm30	cmlz697r20000wagscgomewla	11	DISPONIBLE	ASSET	cmmmn3gh70000rg9k1adwgm6w	t	\N	2026-03-11 22:57:49.945	2026-03-11 22:57:49.945
cmmmn3gkw0002rg9kofjcbtcp	cmlz697r20000wagscgomewla	1105	Caja General	ASSET	cmmmn3gjd0001rg9k2eh6tm30	t	\N	2026-03-11 22:57:50	2026-03-11 22:57:50
cmmmn3gmk0003rg9kwp38vd0j	cmlz697r20000wagscgomewla	1110	Bancos	ASSET	cmmmn3gjd0001rg9k2eh6tm30	t	\N	2026-03-11 22:57:50.06	2026-03-11 22:57:50.06
cmmmn3go10004rg9k90ar4h5g	cmlz697r20000wagscgomewla	13	CUENTAS POR COBRAR	ASSET	cmmmn3gh70000rg9k1adwgm6w	t	\N	2026-03-11 22:57:50.113	2026-03-11 22:57:50.113
cmmmn3gpi0005rg9knh1voxpk	cmlz697r20000wagscgomewla	1305	Clientes Nacionales	ASSET	cmmmn3go10004rg9k90ar4h5g	t	\N	2026-03-11 22:57:50.166	2026-03-11 22:57:50.166
cmmmn3gsj0007rg9kuhtkxpzd	cmlz697r20000wagscgomewla	22	CUENTAS POR PAGAR	LIABILITY	cmmmn3gr00006rg9k272wkvzu	t	\N	2026-03-11 22:57:50.275	2026-03-11 22:57:50.275
cmmmn3gtz0008rg9kp9wsryy6	cmlz697r20000wagscgomewla	2205	Proveedores Nacionales	LIABILITY	cmmmn3gsj0007rg9kuhtkxpzd	t	\N	2026-03-11 22:57:50.327	2026-03-11 22:57:50.327
cmmmn3gvh0009rg9kgsd5cu4t	cmlz697r20000wagscgomewla	24	IMPUESTOS POR PAGAR	LIABILITY	cmmmn3gr00006rg9k272wkvzu	t	\N	2026-03-11 22:57:50.381	2026-03-11 22:57:50.381
cmmmn3gxc000arg9k3fk597bv	cmlz697r20000wagscgomewla	2408	IVA por Causar	LIABILITY	cmmmn3gvh0009rg9kgsd5cu4t	t	\N	2026-03-11 22:57:50.448	2026-03-11 22:57:50.448
cmmmn3h0j000crg9kwbvyiha3	cmlz697r20000wagscgomewla	3105	Capital Social	EQUITY	cmmmn3gz0000brg9kfhuz006o	t	\N	2026-03-11 22:57:50.563	2026-03-11 22:57:50.563
cmmmn3h21000drg9k1i6d37kl	cmlz697r20000wagscgomewla	3205	Utilidad del Ejercicio	EQUITY	cmmmn3gz0000brg9kfhuz006o	t	\N	2026-03-11 22:57:50.617	2026-03-11 22:57:50.617
cmmmn3h55000frg9ks1agli2s	cmlz697r20000wagscgomewla	41	VENTAS	REVENUE	cmmmn3h3l000erg9kycefd51b	t	\N	2026-03-11 22:57:50.729	2026-03-11 22:57:50.729
cmmmn3h6m000grg9k7ph24kzn	cmlz697r20000wagscgomewla	4105	Ventas de Mercancías	REVENUE	cmmmn3h55000frg9ks1agli2s	t	\N	2026-03-11 22:57:50.782	2026-03-11 22:57:50.782
cmmmn3h83000hrg9kbibntqbh	cmlz697r20000wagscgomewla	4110	Ventas de Servicios	REVENUE	cmmmn3h55000frg9ks1agli2s	t	\N	2026-03-11 22:57:50.835	2026-03-11 22:57:50.835
cmmmn3hb5000jrg9ktoc5scan	cmlz697r20000wagscgomewla	51	GASTOS OPERACIONALES	EXPENSE	cmmmn3h9l000irg9koapl24ys	t	\N	2026-03-11 22:57:50.945	2026-03-11 22:57:50.945
cmmmn3hcn000krg9kbl9apqwm	cmlz697r20000wagscgomewla	5105	Gastos de Personal	EXPENSE	cmmmn3hb5000jrg9ktoc5scan	t	\N	2026-03-11 22:57:50.999	2026-03-11 22:57:50.999
cmmmn3he8000lrg9kn2zln8mz	cmlz697r20000wagscgomewla	5110	Gastos de Servicios Públicos	EXPENSE	cmmmn3hb5000jrg9ktoc5scan	t	\N	2026-03-11 22:57:51.056	2026-03-11 22:57:51.056
cmmmn3hfs000mrg9knl1itej9	cmlz697r20000wagscgomewla	5115	Gastos de Arrendamiento	EXPENSE	cmmmn3hb5000jrg9ktoc5scan	t	\N	2026-03-11 22:57:51.112	2026-03-11 22:57:51.112
cmmmpqpfz0002py9kakm0jz68	cmlz697r20000wagscgomewla	111001	Banco Popular	ASSET	cmmmn3gmk0003rg9kwp38vd0j	t	Banco Popular Dominicano	2026-03-12 00:11:53.807	2026-03-12 00:11:53.807
cmmmrtnbe0001x59kmgycnluf	cmlz697r20000wagscgomewla	1-1	ACTIVO CORRIENTE	ASSET	cmmmn3gh70000rg9k1adwgm6w	t	\N	2026-03-12 01:10:10.25	2026-03-17 12:47:32.252
cmmmn3gz0000brg9kfhuz006o	cmlz697r20000wagscgomewla	3	PATRIMONIO	EQUITY	\N	t	\N	2026-03-11 22:57:50.508	2026-03-17 12:47:34.419
cmmmn3h3l000erg9kycefd51b	cmlz697r20000wagscgomewla	4	INGRESOS	REVENUE	\N	t	\N	2026-03-11 22:57:50.673	2026-03-17 12:47:34.653
cmmmn3h9l000irg9koapl24ys	cmlz697r20000wagscgomewla	5	GASTOS	EXPENSE	\N	t	\N	2026-03-11 22:57:50.889	2026-03-17 12:47:34.998
cmmmn3gh70000rg9k1adwgm6w	cmlz697r20000wagscgomewla	1	ACTIVOS	ASSET	\N	t	\N	2026-03-11 22:57:49.867	2026-03-17 12:47:32.185
cmmmrtncz0002x59kxlcaqcu6	cmlz697r20000wagscgomewla	1-1-01	EFECTIVO Y EQUIVALENTES	ASSET	cmmmrtnbe0001x59kmgycnluf	t	\N	2026-03-12 01:10:10.307	2026-03-17 12:47:32.307
cmmmrtnev0003x59k20kh2oqz	cmlz697r20000wagscgomewla	1-1-01-001	Caja General	ASSET	cmmmrtncz0002x59kxlcaqcu6	t	\N	2026-03-12 01:10:10.375	2026-03-17 12:47:32.363
cmmmrtnh20004x59kl16ckbj3	cmlz697r20000wagscgomewla	1-1-01-002	Caja Chica	ASSET	cmmmrtncz0002x59kxlcaqcu6	t	\N	2026-03-12 01:10:10.454	2026-03-17 12:47:32.418
cmmmrtnix0005x59kwj0bl3tv	cmlz697r20000wagscgomewla	1-1-02	BANCOS	ASSET	cmmmrtnbe0001x59kmgycnluf	t	\N	2026-03-12 01:10:10.521	2026-03-17 12:47:32.473
cmmmrtnkj0006x59k25u0zuht	cmlz697r20000wagscgomewla	1-1-02-001	Banco Popular (Cta. Cte.)	ASSET	cmmmrtnix0005x59kwj0bl3tv	t	\N	2026-03-12 01:10:10.579	2026-03-17 12:47:32.529
cmmmrtnml0007x59kuleht5dv	cmlz697r20000wagscgomewla	1-1-02-002	Banco Reservas (Cta. Cte.)	ASSET	cmmmrtnix0005x59kwj0bl3tv	t	\N	2026-03-12 01:10:10.653	2026-03-17 12:47:32.587
cmmmrtnob0008x59kfw1dawru	cmlz697r20000wagscgomewla	1-1-02-003	Banco BHD (Cta. Cte.)	ASSET	cmmmrtnix0005x59kwj0bl3tv	t	\N	2026-03-12 01:10:10.715	2026-03-17 12:47:32.643
cmmmrtnq50009x59k5so5b69a	cmlz697r20000wagscgomewla	1-1-03	CUENTAS POR COBRAR	ASSET	cmmmrtnbe0001x59kmgycnluf	t	\N	2026-03-12 01:10:10.781	2026-03-17 12:47:32.698
cmmmrtnro000ax59kh4rthens	cmlz697r20000wagscgomewla	1-1-03-001	Clientes Nacionales	ASSET	cmmmrtnq50009x59k5so5b69a	t	\N	2026-03-12 01:10:10.836	2026-03-17 12:47:32.754
cmmmrtntb000bx59kpsjqbnpb	cmlz697r20000wagscgomewla	1-1-03-002	Clientes del Exterior	ASSET	cmmmrtnq50009x59k5so5b69a	t	\N	2026-03-12 01:10:10.895	2026-03-17 12:47:32.811
cmmmrtnuu000cx59kw1vucboj	cmlz697r20000wagscgomewla	1-1-03-003	Cobros a Directivos y Empleados	ASSET	cmmmrtnq50009x59k5so5b69a	t	\N	2026-03-12 01:10:10.95	2026-03-17 12:47:32.867
cmmmrtnwd000dx59kj4bdlnvh	cmlz697r20000wagscgomewla	1-1-04	INVENTARIOS	ASSET	cmmmrtnbe0001x59kmgycnluf	t	\N	2026-03-12 01:10:11.005	2026-03-17 12:47:32.922
cmmmrtnxw000ex59kcl4bzafn	cmlz697r20000wagscgomewla	1-1-04-001	Mercancías Disponibles	ASSET	cmmmrtnwd000dx59kj4bdlnvh	t	\N	2026-03-12 01:10:11.06	2026-03-17 12:47:33.041
cmmmrtnzw000fx59kdmo4lfll	cmlz697r20000wagscgomewla	1-1-04-002	Mercancías en Tránsito	ASSET	cmmmrtnwd000dx59kj4bdlnvh	t	\N	2026-03-12 01:10:11.132	2026-03-17 12:47:33.108
cmmmrto1g000gx59k817u52u4	cmlz697r20000wagscgomewla	1-1-05	ITBIS COMPRAS (Crédito Fiscal)	ASSET	cmmmrtnbe0001x59kmgycnluf	t	\N	2026-03-12 01:10:11.188	2026-03-17 12:47:33.164
cmmmrto30000hx59k3n757cjl	cmlz697r20000wagscgomewla	1-1-05-001	ITBIS Compras Locales (18%)	ASSET	cmmmrto1g000gx59k817u52u4	t	\N	2026-03-12 01:10:11.244	2026-03-17 12:47:33.218
cmmmrto59000ix59k4b24byw5	cmlz697r20000wagscgomewla	1-1-05-002	ITBIS Importaciones	ASSET	cmmmrto1g000gx59k817u52u4	t	\N	2026-03-12 01:10:11.325	2026-03-17 12:47:33.278
cmmmrto6t000jx59k2d9qzzxd	cmlz697r20000wagscgomewla	1-2	ACTIVOS NO CORRIENTES	ASSET	cmmmn3gh70000rg9k1adwgm6w	t	\N	2026-03-12 01:10:11.381	2026-03-17 12:47:33.335
cmmmrto8d000kx59krl9priod	cmlz697r20000wagscgomewla	1-2-01	PROPIEDAD, PLANTA Y EQUIPO	ASSET	cmmmrto6t000jx59k2d9qzzxd	t	\N	2026-03-12 01:10:11.437	2026-03-17 12:47:33.39
cmmmrto9x000lx59k336fhcsc	cmlz697r20000wagscgomewla	1-2-01-001	Equipos de Oficina	ASSET	cmmmrto8d000kx59krl9priod	t	\N	2026-03-12 01:10:11.493	2026-03-17 12:47:33.444
cmmmrtobp000mx59ko729h9k0	cmlz697r20000wagscgomewla	1-2-01-002	Equipos de Computación	ASSET	cmmmrto8d000kx59krl9priod	t	\N	2026-03-12 01:10:11.557	2026-03-17 12:47:33.499
cmmmrtodl000nx59k0vio8xyw	cmlz697r20000wagscgomewla	1-2-01-003	Mobiliario y Equipo	ASSET	cmmmrto8d000kx59krl9priod	t	\N	2026-03-12 01:10:11.625	2026-03-17 12:47:33.559
cmmmrtof7000ox59k8yfs7rb7	cmlz697r20000wagscgomewla	1-2-01-004	Vehículos	ASSET	cmmmrto8d000kx59krl9priod	t	\N	2026-03-12 01:10:11.683	2026-03-17 12:47:33.618
cmmmn3gr00006rg9k272wkvzu	cmlz697r20000wagscgomewla	2	PASIVOS	LIABILITY	\N	t	\N	2026-03-11 22:57:50.22	2026-03-17 12:47:33.73
cmmmrtogr000px59kghjlutoh	cmlz697r20000wagscgomewla	1-2-02	DEPRECIACIÓN ACUMULADA	ASSET	cmmmrto6t000jx59k2d9qzzxd	t	\N	2026-03-12 01:10:11.739	2026-03-17 12:47:33.674
cmmmrtokw000rx59k9f3tv9wh	cmlz697r20000wagscgomewla	2-1	PASIVO CORRIENTE	LIABILITY	cmmmn3gr00006rg9k272wkvzu	t	\N	2026-03-12 01:10:11.888	2026-03-17 12:47:33.788
cmmmrtomf000sx59kfam4em1i	cmlz697r20000wagscgomewla	2-1-01	CUENTAS POR PAGAR	LIABILITY	cmmmrtokw000rx59k9f3tv9wh	t	\N	2026-03-12 01:10:11.943	2026-03-17 12:47:33.852
cmmmrtonz000tx59kk51e2uc5	cmlz697r20000wagscgomewla	2-1-01-001	Proveedores Nacionales	LIABILITY	cmmmrtomf000sx59kfam4em1i	t	\N	2026-03-12 01:10:11.999	2026-03-17 12:47:33.908
cmmmrtopi000ux59kqumtbttq	cmlz697r20000wagscgomewla	2-1-01-002	Proveedores del Exterior	LIABILITY	cmmmrtomf000sx59kfam4em1i	t	\N	2026-03-12 01:10:12.054	2026-03-17 12:47:33.963
cmmmrtor3000vx59k7g6k4vnc	cmlz697r20000wagscgomewla	2-1-02	ITBIS VENTAS (Débito Fiscal)	LIABILITY	cmmmrtokw000rx59k9f3tv9wh	t	\N	2026-03-12 01:10:12.111	2026-03-17 12:47:34.024
cmmmrtosn000wx59kjtqrlqni	cmlz697r20000wagscgomewla	2-1-02-001	ITBIS Ventas Locales (18%)	LIABILITY	cmmmrtor3000vx59k7g6k4vnc	t	\N	2026-03-12 01:10:12.167	2026-03-17 12:47:34.078
cmmmrtovb000xx59k4f00uird	cmlz697r20000wagscgomewla	2-1-03	IMPUESTOS Y APORTES POR PAGAR	LIABILITY	cmmmrtokw000rx59k9f3tv9wh	t	\N	2026-03-12 01:10:12.263	2026-03-17 12:47:34.137
cmmmrtowv000yx59kvd4wc7yd	cmlz697r20000wagscgomewla	2-1-03-001	Retención ISR por Pagar	LIABILITY	cmmmrtovb000xx59k4f00uird	t	\N	2026-03-12 01:10:12.319	2026-03-17 12:47:34.191
cmmmrtoyi000zx59kkpi4n3w9	cmlz697r20000wagscgomewla	2-1-03-002	Retención ITBIS por Pagar	LIABILITY	cmmmrtovb000xx59k4f00uird	t	\N	2026-03-12 01:10:12.378	2026-03-17 12:47:34.247
cmmmrtp010010x59ksruf9pyv	cmlz697r20000wagscgomewla	2-1-03-003	TSS por Pagar (Seguridad Social)	LIABILITY	cmmmrtovb000xx59k4f00uird	t	\N	2026-03-12 01:10:12.433	2026-03-17 12:47:34.302
cmmmrtp1y0011x59khygcrriz	cmlz697r20000wagscgomewla	2-1-03-004	INFOTEP por Pagar	LIABILITY	cmmmrtovb000xx59k4f00uird	t	\N	2026-03-12 01:10:12.502	2026-03-17 12:47:34.357
cmmmrtp5i0013x59kr5s8eltr	cmlz697r20000wagscgomewla	3-1-01-001	Capital Social Suscrito	EQUITY	cmmmn3gz0000brg9kfhuz006o	t	\N	2026-03-12 01:10:12.63	2026-03-17 12:47:34.476
cmmmrtp710014x59kwvqitkgn	cmlz697r20000wagscgomewla	3-1-02-001	Utilidad (Pérdida) del Ejercicio	EQUITY	cmmmn3gz0000brg9kfhuz006o	t	\N	2026-03-12 01:10:12.685	2026-03-17 12:47:34.538
cmmmrtp920015x59k6i2mzd58	cmlz697r20000wagscgomewla	3-1-02-002	Utilidades Acumuladas	EQUITY	cmmmn3gz0000brg9kfhuz006o	t	\N	2026-03-12 01:10:12.757	2026-03-17 12:47:34.596
cmmmrtpj10017x59kffk6ot4y	cmlz697r20000wagscgomewla	4-1-01-001	Ventas de Mercancías Locales	REVENUE	cmmmn3h3l000erg9kycefd51b	t	\N	2026-03-12 01:10:13.117	2026-03-17 12:47:34.713
cmmmrtpkn0018x59kdpdg5s2w	cmlz697r20000wagscgomewla	4-1-01-002	Ventas de Mercancías al Exterior	REVENUE	cmmmn3h3l000erg9kycefd51b	t	\N	2026-03-12 01:10:13.175	2026-03-17 12:47:34.769
cmmmrtpm90019x59kcxmzbwp5	cmlz697r20000wagscgomewla	4-1-02-001	Prestación de Servicios	REVENUE	cmmmn3h3l000erg9kycefd51b	t	\N	2026-03-12 01:10:13.233	2026-03-17 12:47:34.826
cmmmrtpo9001ax59k0z06v627	cmlz697r20000wagscgomewla	4-1-03-001	Ingresos Diversos	REVENUE	cmmmn3h3l000erg9kycefd51b	t	\N	2026-03-12 01:10:13.305	2026-03-17 12:47:34.883
cmmmrtppu001bx59koaxznbdj	cmlz697r20000wagscgomewla	4-2-01-001	Descuentos sobre Ventas	REVENUE	cmmmn3h3l000erg9kycefd51b	t	\N	2026-03-12 01:10:13.362	2026-03-17 12:47:34.942
cmmmrtpsy001dx59kzwe4vfeq	cmlz697r20000wagscgomewla	5-1	GASTOS DE OPERACIÓN	EXPENSE	cmmmn3h9l000irg9koapl24ys	t	\N	2026-03-12 01:10:13.474	2026-03-17 12:47:35.054
cmmmrtpvq001ex59km7t44ewn	cmlz697r20000wagscgomewla	5-1-01-001	Sueldos y Salarios	EXPENSE	cmmmrtpsy001dx59kzwe4vfeq	t	\N	2026-03-12 01:10:13.574	2026-03-17 12:47:35.108
cmmmrtpxs001fx59kz8o1acyn	cmlz697r20000wagscgomewla	5-1-01-002	Seguridad Social (TSS)	EXPENSE	cmmmrtpsy001dx59kzwe4vfeq	t	\N	2026-03-12 01:10:13.648	2026-03-17 12:47:35.164
cmmmrtpza001gx59kv3vtpbn0	cmlz697r20000wagscgomewla	5-1-01-003	INFOTEP	EXPENSE	cmmmrtpsy001dx59kzwe4vfeq	t	\N	2026-03-12 01:10:13.702	2026-03-17 12:47:35.218
cmmmrtq0v001hx59k9ogqpidz	cmlz697r20000wagscgomewla	5-1-02-001	Arrendamientos	EXPENSE	cmmmrtpsy001dx59kzwe4vfeq	t	\N	2026-03-12 01:10:13.759	2026-03-17 12:47:35.273
cmmmrtq2g001ix59k9i35fcyf	cmlz697r20000wagscgomewla	5-1-03-001	Servicios Públicos (Luz, Agua, Teléfono)	EXPENSE	cmmmrtpsy001dx59kzwe4vfeq	t	\N	2026-03-12 01:10:13.816	2026-03-17 12:47:35.328
cmmmrtq4d001jx59kszsc7q1c	cmlz697r20000wagscgomewla	5-1-04-001	Internet y Telecomunicaciones	EXPENSE	cmmmrtpsy001dx59kzwe4vfeq	t	\N	2026-03-12 01:10:13.885	2026-03-17 12:47:35.384
cmmmrtq68001kx59krl0o5rha	cmlz697r20000wagscgomewla	5-1-05-001	Útiles y Materiales de Oficina	EXPENSE	cmmmrtpsy001dx59kzwe4vfeq	t	\N	2026-03-12 01:10:13.952	2026-03-17 12:47:35.438
cmmmrtq82001lx59k0hrrohhb	cmlz697r20000wagscgomewla	5-1-06-001	Mantenimiento y Reparaciones	EXPENSE	cmmmrtpsy001dx59kzwe4vfeq	t	\N	2026-03-12 01:10:14.018	2026-03-17 12:47:35.493
cmmmrtq9o001mx59kalncm8tn	cmlz697r20000wagscgomewla	5-1-07-001	Combustibles y Lubricantes	EXPENSE	cmmmrtpsy001dx59kzwe4vfeq	t	\N	2026-03-12 01:10:14.076	2026-03-17 12:47:35.548
cmmmrtqb8001nx59k5e0gn1iu	cmlz697r20000wagscgomewla	5-1-08-001	Seguros	EXPENSE	cmmmrtpsy001dx59kzwe4vfeq	t	\N	2026-03-12 01:10:14.132	2026-03-17 12:47:35.604
cmmmrtqdw001ox59k79p8a0jg	cmlz697r20000wagscgomewla	5-1-09-001	Gastos de Ventas	EXPENSE	cmmmrtpsy001dx59kzwe4vfeq	t	\N	2026-03-12 01:10:14.228	2026-03-17 12:47:35.66
cmmmrtqfg001px59k6e7zfmzz	cmlz697r20000wagscgomewla	5-1-10-001	Gastos Bancarios	EXPENSE	cmmmrtpsy001dx59kzwe4vfeq	t	\N	2026-03-12 01:10:14.284	2026-03-17 12:47:35.715
cmmmrtqhq001qx59kfrfo7nfx	cmlz697r20000wagscgomewla	5-1-11-001	Depreciación y Amortización	EXPENSE	cmmmrtpsy001dx59kzwe4vfeq	t	\N	2026-03-12 01:10:14.366	2026-03-17 12:47:35.773
cmmmrtqjc001rx59kgkvxvf84	cmlz697r20000wagscgomewla	5-1-99-001	Otros Gastos de Operación	EXPENSE	cmmmrtpsy001dx59kzwe4vfeq	t	\N	2026-03-12 01:10:14.424	2026-03-17 12:47:35.835
\.


--
-- Data for Name: ActivityLog; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."ActivityLog" (id, "organizationId", "userId", type, action, description, module, "entityType", "entityId", "oldValues", "newValues", "ipAddress", "userAgent", "createdAt") FROM stdin;
cmms6aj8j000djpgrepwcjoia	cmlz697r20000wagscgomewla	cmlz6980u0001wagsy7xrc0kl	CREATE	invoice.create	Creó factura FE-1104 por $41.30	invoices	Invoice	cmms6aiha0007jpgrw99drbcq	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	2026-03-15 19:54:03.619
cmms6evi6000mjpgrqkscp6zo	cmlz697r20000wagscgomewla	cmlz6980u0001wagsy7xrc0kl	CREATE	product.create	Creó producto Memoria ram	products	Product	\N	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	2026-03-15 19:57:26.142
cmms701oj0011jpgrtq0rmlb8	cmlz697r20000wagscgomewla	cmlz6980u0001wagsy7xrc0kl	CREATE	invoice.create	Factura #cmms6zy4i000ujpgrnkmp9i51 creada	\N	invoice	cmms6zy4i000ujpgrnkmp9i51	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	2026-03-15 20:13:53.923
cmmsarc9v000158gr4qj7gzpf	cmlz697r20000wagscgomewla	cmlz6980u0001wagsy7xrc0kl	CREATE	shift.open	Turno de caja abierto con $2500.00	caja	CashDrawerShift	cmmsarc77000058gr9x8w95g0	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	2026-03-15 21:59:06.21
cmmum2a240001cg9kyhomn6nh	cmlz697r20000wagscgomewla	cmlz6980u0001wagsy7xrc0kl	CREATE	vehicle.create	Creó vehículo Toyota RAV4	vehicles	Vehicle	cmmum29q10000cg9kngzk10r6	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	2026-03-17 12:51:04.684
cmn0mps230000ij9ktlwl13pj	cmlz697r20000wagscgomewla	cmlz6980u0001wagsy7xrc0kl	UPDATE	workOrder.status	Cambió estado de orden OS-0002 a DIAGNOSIS	workOrders	WorkOrder	test-workorder-2	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	2026-03-21 17:55:58.155
cmn0mptsm0001ij9kuesse0l3	cmlz697r20000wagscgomewla	cmlz6980u0001wagsy7xrc0kl	UPDATE	workOrder.status	Cambió estado de orden OS-0003 a RECEIVED	workOrders	WorkOrder	test-workorder-3	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	2026-03-21 17:56:00.406
cmn0mqndd0002ij9kbk4tw0ve	cmlz697r20000wagscgomewla	cmlz6980u0001wagsy7xrc0kl	UPDATE	workOrder.status	Cambió estado de orden OS-0002 a FINISHED	workOrders	WorkOrder	test-workorder-2	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	2026-03-21 17:56:38.737
cmn0mv5j00003ij9kb1vwzfvj	cmlz697r20000wagscgomewla	cmlz6980u0001wagsy7xrc0kl	UPDATE	workOrder.status	Cambió estado de orden OS-0002 a APPROVED	workOrders	WorkOrder	test-workorder-2	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	2026-03-21 18:00:08.892
cmn0myaq80000vu9kpkg4z9bs	cmlz697r20000wagscgomewla	cmlz6980u0001wagsy7xrc0kl	UPDATE	workOrder.status	Cambió estado de orden OS-0002 a IN_PROGRESS	workOrders	WorkOrder	test-workorder-2	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	2026-03-21 18:02:35.6
cmn0od7ci0001vu9kdqvv7ogi	cmlz697r20000wagscgomewla	cmlz6980u0001wagsy7xrc0kl	UPDATE	workOrder.status	Cambió estado de orden OS-0002 a APPROVED	workOrders	WorkOrder	test-workorder-2	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	2026-03-21 18:42:10.674
cmn0odcf90002vu9k1zo2bfyy	cmlz697r20000wagscgomewla	cmlz6980u0001wagsy7xrc0kl	UPDATE	workOrder.status	Cambió estado de orden OS-0002 a DIAGNOSIS	workOrders	WorkOrder	test-workorder-2	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	2026-03-21 18:42:17.253
cmn0q2l0g0000tt9kgrtsg4n0	cmlz697r20000wagscgomewla	cmlz6980u0001wagsy7xrc0kl	UPDATE	workOrder.status	Cambió estado de orden OS-0003 a DIAGNOSIS	workOrders	WorkOrder	test-workorder-3	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	2026-03-21 19:29:54.399
cmn0q2udc0001tt9koun7fwvk	cmlz697r20000wagscgomewla	cmlz6980u0001wagsy7xrc0kl	UPDATE	workOrder.status	Cambió estado de orden OS-0003 a RECEIVED	workOrders	WorkOrder	test-workorder-3	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	2026-03-21 19:30:06.528
cmn0q3aju0002tt9k3kx66d4i	cmlz697r20000wagscgomewla	cmlz6980u0001wagsy7xrc0kl	UPDATE	workOrder.status	Cambió estado de orden OS-0003 a RECEIVED	workOrders	WorkOrder	test-workorder-3	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	2026-03-21 19:30:27.498
cmn0q3f6w0003tt9kvjt7r2ec	cmlz697r20000wagscgomewla	cmlz6980u0001wagsy7xrc0kl	UPDATE	workOrder.status	Cambió estado de orden OS-0003 a DIAGNOSIS	workOrders	WorkOrder	test-workorder-3	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	2026-03-21 19:30:33.512
cmn0q4wux0004tt9kdznw73fx	cmlz697r20000wagscgomewla	cmlz6980u0001wagsy7xrc0kl	UPDATE	workOrder.status	Cambió estado de orden OS-0003 a RECEIVED	workOrders	WorkOrder	test-workorder-3	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	2026-03-21 19:31:43.065
cmn0q5r5m0005tt9k7ng6gquu	cmlz697r20000wagscgomewla	cmlz6980u0001wagsy7xrc0kl	UPDATE	workOrder.status	Cambió estado de orden OS-0003 a DIAGNOSIS	workOrders	WorkOrder	test-workorder-3	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	2026-03-21 19:32:22.33
cmn0q728r00007y9khlqcrwyr	cmlz697r20000wagscgomewla	cmlz6980u0001wagsy7xrc0kl	UPDATE	workOrder.status	Cambió estado de orden OS-0003 a DIAGNOSIS	workOrders	WorkOrder	test-workorder-3	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	2026-03-21 19:33:23.355
cmn0q76g800017y9k0s711g2c	cmlz697r20000wagscgomewla	cmlz6980u0001wagsy7xrc0kl	UPDATE	workOrder.status	Cambió estado de orden OS-0002 a RECEIVED	workOrders	WorkOrder	test-workorder-2	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	2026-03-21 19:33:28.808
cmn0q8vli00027y9kdasd93ta	cmlz697r20000wagscgomewla	cmlz6980u0001wagsy7xrc0kl	UPDATE	workOrder.status	Cambió estado de orden OS-0003 a RECEIVED	workOrders	WorkOrder	test-workorder-3	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	2026-03-21 19:34:48.054
cmn0q97bc00037y9k25qdx26n	cmlz697r20000wagscgomewla	cmlz6980u0001wagsy7xrc0kl	UPDATE	workOrder.status	Cambió estado de orden OS-0003 a DIAGNOSIS	workOrders	WorkOrder	test-workorder-3	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	2026-03-21 19:35:03.24
cmn0q9gps00047y9kw996w4m8	cmlz697r20000wagscgomewla	cmlz6980u0001wagsy7xrc0kl	UPDATE	workOrder.status	Cambió estado de orden OS-0003 a RECEIVED	workOrders	WorkOrder	test-workorder-3	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	2026-03-21 19:35:15.424
cmn0q9y1k00057y9kx0virin8	cmlz697r20000wagscgomewla	cmlz6980u0001wagsy7xrc0kl	UPDATE	workOrder.status	Cambió estado de orden OS-0002 a DIAGNOSIS	workOrders	WorkOrder	test-workorder-2	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	2026-03-21 19:35:37.88
cmn0qabjh00067y9km10kml5h	cmlz697r20000wagscgomewla	cmlz6980u0001wagsy7xrc0kl	UPDATE	workOrder.status	Cambió estado de orden OS-0003 a FINISHED	workOrders	WorkOrder	test-workorder-3	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	2026-03-21 19:35:55.373
cmn0unvkl0000mq9k6rzb397d	cmlz697r20000wagscgomewla	cmlz6980u0001wagsy7xrc0kl	UPDATE	workOrder.status	Cambió estado de orden OS-0002 a RECEIVED	workOrders	WorkOrder	test-workorder-2	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	2026-03-21 21:38:26.325
cmn0v6aj60000829ksgorsc23	cmlz697r20000wagscgomewla	cmlz6980u0001wagsy7xrc0kl	UPDATE	workOrder.status	Cambió estado de orden OS-0002 a DIAGNOSIS	workOrders	WorkOrder	test-workorder-2	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	2026-03-21 21:52:45.522
cmn0v6hsf0001829ks0gyx1ft	cmlz697r20000wagscgomewla	cmlz6980u0001wagsy7xrc0kl	UPDATE	workOrder.status	Cambió estado de orden OS-0002 a RECEIVED	workOrders	WorkOrder	test-workorder-2	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	2026-03-21 21:52:54.927
cmn0vag0h00005f9kv5v9ahse	cmlz697r20000wagscgomewla	cmlz6980u0001wagsy7xrc0kl	UPDATE	workOrder.status	Cambió estado de orden OS-0002 a DIAGNOSIS	workOrders	WorkOrder	test-workorder-2	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	2026-03-21 21:55:59.248
cmn0vb7j300015f9k9zz69nhm	cmlz697r20000wagscgomewla	cmlz6980u0001wagsy7xrc0kl	UPDATE	workOrder.status	Cambió estado de orden OS-0002 a RECEIVED	workOrders	WorkOrder	test-workorder-2	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	2026-03-21 21:56:34.911
cmn0vbpkp00025f9khuzd3jaj	cmlz697r20000wagscgomewla	cmlz6980u0001wagsy7xrc0kl	UPDATE	workOrder.status	Cambió estado de orden OS-0002 a RECEIVED	workOrders	WorkOrder	test-workorder-2	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	2026-03-21 21:56:58.297
cmn0vbxym00035f9kjiocwuu4	cmlz697r20000wagscgomewla	cmlz6980u0001wagsy7xrc0kl	UPDATE	workOrder.status	Cambió estado de orden OS-0002 a DIAGNOSIS	workOrders	WorkOrder	test-workorder-2	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	2026-03-21 21:57:09.166
cmn0vfqh30000pi9kolvzptcq	cmlz697r20000wagscgomewla	cmlz6980u0001wagsy7xrc0kl	UPDATE	workOrder.status	Cambió estado de orden OS-0002 a RECEIVED	workOrders	WorkOrder	test-workorder-2	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	2026-03-21 22:00:06.087
cmn0vk50g00008g9ksug1ugkf	cmlz697r20000wagscgomewla	cmlz6980u0001wagsy7xrc0kl	UPDATE	workOrder.status	Cambió estado de orden OS-0002 a DIAGNOSIS	workOrders	WorkOrder	test-workorder-2	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	2026-03-21 22:03:31.552
cmn0vkk1100018g9kc8wdh2dr	cmlz697r20000wagscgomewla	cmlz6980u0001wagsy7xrc0kl	UPDATE	workOrder.status	Cambió estado de orden OS-0002 a RECEIVED	workOrders	WorkOrder	test-workorder-2	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	2026-03-21 22:03:51.013
cmn0vmwtw0000ty9kxwei12rv	cmlz697r20000wagscgomewla	cmlz6980u0001wagsy7xrc0kl	UPDATE	workOrder.status	Cambió estado de orden OS-0002 a IN_PROGRESS	workOrders	WorkOrder	test-workorder-2	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	2026-03-21 22:05:40.916
cmn0vnquj0001ty9k72bt8mr5	cmlz697r20000wagscgomewla	cmlz6980u0001wagsy7xrc0kl	UPDATE	workOrder.status	Cambió estado de orden OS-0002 a DIAGNOSIS	workOrders	WorkOrder	test-workorder-2	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	2026-03-21 22:06:19.819
cmn0vohct0002ty9k3vfj71p2	cmlz697r20000wagscgomewla	cmlz6980u0001wagsy7xrc0kl	UPDATE	workOrder.status	Cambió estado de orden OS-0002 a RECEIVED	workOrders	WorkOrder	test-workorder-2	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	2026-03-21 22:06:54.173
cmn0vtnvk0003ty9kjilx219z	cmlz697r20000wagscgomewla	cmlz6980u0001wagsy7xrc0kl	UPDATE	workOrder.status	Cambió estado de orden OS-0002 a DIAGNOSIS	workOrders	WorkOrder	test-workorder-2	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	2026-03-21 22:10:55.904
cmn0w1j7i0004ty9krotmnxia	cmlz697r20000wagscgomewla	cmlz6980u0001wagsy7xrc0kl	UPDATE	workOrder.status	Cambió estado de orden OS-0002 a RECEIVED	workOrders	WorkOrder	test-workorder-2	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	2026-03-21 22:17:03.102
cmn0w3rwg0000pr9khr9obxky	cmlz697r20000wagscgomewla	cmlz6980u0001wagsy7xrc0kl	UPDATE	workOrder.status	Cambió estado de orden OS-0002 a DIAGNOSIS	workOrders	WorkOrder	test-workorder-2	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	2026-03-21 22:18:47.68
cmn0w44j40001pr9k6mhsfrao	cmlz697r20000wagscgomewla	cmlz6980u0001wagsy7xrc0kl	UPDATE	workOrder.status	Cambió estado de orden OS-0002 a RECEIVED	workOrders	WorkOrder	test-workorder-2	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	2026-03-21 22:19:04.048
cmn0w8jwc0000e69kbgix61t2	cmlz697r20000wagscgomewla	cmlz6980u0001wagsy7xrc0kl	UPDATE	workOrder.status	Cambió estado de orden OS-0002 a DIAGNOSIS	workOrders	WorkOrder	test-workorder-2	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	2026-03-21 22:22:30.588
cmn0w92bs0001e69k5chct490	cmlz697r20000wagscgomewla	cmlz6980u0001wagsy7xrc0kl	UPDATE	workOrder.status	Cambió estado de orden OS-0002 a APPROVED	workOrders	WorkOrder	test-workorder-2	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	2026-03-21 22:22:54.472
cmn0wucah0000qc9k3l54o9nd	cmlz697r20000wagscgomewla	cmlz6980u0001wagsy7xrc0kl	UPDATE	workOrder.status	Cambió estado de orden OS-0002 a DIAGNOSIS	workOrders	WorkOrder	test-workorder-2	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	2026-03-21 22:39:27.161
cmn0wvbxj0001qc9kduypjh00	cmlz697r20000wagscgomewla	cmlz6980u0001wagsy7xrc0kl	UPDATE	workOrder.status	Cambió estado de orden OS-0002 a RECEIVED	workOrders	WorkOrder	test-workorder-2	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	2026-03-21 22:40:13.351
cmn0wvj4h0002qc9kopfvshuu	cmlz697r20000wagscgomewla	cmlz6980u0001wagsy7xrc0kl	UPDATE	workOrder.status	Cambió estado de orden OS-0002 a DIAGNOSIS	workOrders	WorkOrder	test-workorder-2	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	2026-03-21 22:40:22.673
cmn0wvo190003qc9k5lah5me2	cmlz697r20000wagscgomewla	cmlz6980u0001wagsy7xrc0kl	UPDATE	workOrder.status	Cambió estado de orden OS-0002 a RECEIVED	workOrders	WorkOrder	test-workorder-2	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	2026-03-21 22:40:29.037
cmn0ww2aq0004qc9k79m3qxuj	cmlz697r20000wagscgomewla	cmlz6980u0001wagsy7xrc0kl	UPDATE	workOrder.status	Cambió estado de orden OS-0002 a DIAGNOSIS	workOrders	WorkOrder	test-workorder-2	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	2026-03-21 22:40:47.522
cmn0zajuh0000uz9kfvr8fk4s	cmlz697r20000wagscgomewla	cmlz6980u0001wagsy7xrc0kl	UPDATE	workOrder.status	Cambió estado de orden OS-0002 a RECEIVED	workOrders	WorkOrder	test-workorder-2	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	2026-03-21 23:48:02.681
cmn0zao3g0001uz9k2sq6j6sk	cmlz697r20000wagscgomewla	cmlz6980u0001wagsy7xrc0kl	UPDATE	workOrder.status	Cambió estado de orden OS-0002 a APPROVED	workOrders	WorkOrder	test-workorder-2	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	2026-03-21 23:48:08.188
cmn0zar6q0002uz9ka1qoq5a1	cmlz697r20000wagscgomewla	cmlz6980u0001wagsy7xrc0kl	UPDATE	workOrder.status	Cambió estado de orden OS-0002 a DIAGNOSIS	workOrders	WorkOrder	test-workorder-2	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	2026-03-21 23:48:12.194
cmn105har0000bc9kk6btyrxx	cmlz697r20000wagscgomewla	cmlz6980u0001wagsy7xrc0kl	UPDATE	workOrder.status	Cambió estado de orden OS-0002 a RECEIVED	workOrders	WorkOrder	test-workorder-2	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	2026-03-22 00:12:05.715
\.


--
-- Data for Name: AssetCategory; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."AssetCategory" (id, "organizationId", name, code, "depreciationMethod", "usefulLifeYears", "depreciationRate", "accountAssetId", "accountDepreciationId", "accountExpenseId", "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: AssetDepreciation; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."AssetDepreciation" (id, "organizationId", "assetId", date, period, amount, accumulated, "journalEntryId", notes, "createdAt") FROM stdin;
\.


--
-- Data for Name: BankAccount; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."BankAccount" (id, "organizationId", name, "bankName", "accountNumber", "accountType", currency, "initialBalance", "currentBalance", status, description, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: BankReconciliation; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."BankReconciliation" (id, "organizationId", "bankAccountId", date, "initialBalance", "finalBalance", "statementTotal", "systemTotal", difference, status, notes, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: BankStatementImport; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."BankStatementImport" (id, "organizationId", "bankAccountId", filename, "fileSize", "importDate", transactions, status, "errorMessage", "previewData", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: BillOfMaterials; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."BillOfMaterials" (id, "organizationId", "productId", version, "isActive", "isDefault", "variantMatch", "totalCost", "createdAt", "updatedAt") FROM stdin;
cmmqu81ow0000nj9k26qfkjw1	cmlz697r20000wagscgomewla	prod-cmlz697r20000wagscgomewla-ventana	1.0	t	t	\N	0.00	2026-03-14 21:28:25.944	2026-03-14 21:28:25.944
cmmqu82q40007nj9kn7r3hbn3	cmlz697r20000wagscgomewla	prod-cmlz697r20000wagscgomewla-estante	1.0	t	t	\N	0.00	2026-03-14 21:28:27.272	2026-03-14 21:28:27.272
\.


--
-- Data for Name: BoMItem; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."BoMItem" (id, "bomId", "componentId", quantity, "quantityFormula", "isOptional", "scrapPercent", "applyToVariants", sequence, "createdAt", "updatedAt") FROM stdin;
cmmqu81su0001nj9kytp7qgok	cmmqu81ow0000nj9k26qfkjw1	prod-cmlz697r20000wagscgomewla-perfil	0.0000	({width} + {height}) * 2	f	5.00	\N	1	2026-03-14 21:28:25.944	2026-03-14 21:28:25.944
cmmqu81su0002nj9k4r3cmmku	cmmqu81ow0000nj9k26qfkjw1	prod-cmlz697r20000wagscgomewla-vidrio	0.0000	{width} * {height} * 1.1	f	10.00	\N	2	2026-03-14 21:28:25.944	2026-03-14 21:28:25.944
cmmqu81su0003nj9ka29ifne9	cmmqu81ow0000nj9k26qfkjw1	prod-cmlz697r20000wagscgomewla-tornillo	0.0000	round(({width} + {height}) * 8)	f	0.00	\N	3	2026-03-14 21:28:25.944	2026-03-14 21:28:25.944
cmmqu81su0004nj9kofmbx65j	cmmqu81ow0000nj9k26qfkjw1	prod-cmlz697r20000wagscgomewla-sellador	0.0000	({width} + {height}) * 2 / 10	f	0.00	\N	4	2026-03-14 21:28:25.944	2026-03-14 21:28:25.944
cmmqu81su0005nj9ksv6g03uk	cmmqu81ow0000nj9k26qfkjw1	prod-cmlz697r20000wagscgomewla-vinilo	0.0000	({width} + {height}) * 2	f	5.00	\N	5	2026-03-14 21:28:25.944	2026-03-14 21:28:25.944
cmmqu81su0006nj9kpwh1sfi7	cmmqu81ow0000nj9k26qfkjw1	prod-cmlz697r20000wagscgomewla-burlete	0.0000	({width} + {height}) * 2	f	5.00	\N	6	2026-03-14 21:28:25.944	2026-03-14 21:28:25.944
cmmqu82rt0008nj9krl2xq3ga	cmmqu82q40007nj9kn7r3hbn3	prod-cmlz697r20000wagscgomewla-madera	0.0000	{width} * {height} * 0.02	f	15.00	\N	1	2026-03-14 21:28:27.272	2026-03-14 21:28:27.272
cmmqu82rt0009nj9kqmz8nlh5	cmmqu82q40007nj9kn7r3hbn3	prod-cmlz697r20000wagscgomewla-plywood	0.0000	({width} * {height}) / 2	f	10.00	\N	2	2026-03-14 21:28:27.272	2026-03-14 21:28:27.272
cmmqu82rt000anj9kvu2u7vsi	cmmqu82q40007nj9kn7r3hbn3	prod-cmlz697r20000wagscgomewla-manija	2.0000	\N	f	0.00	\N	3	2026-03-14 21:28:27.272	2026-03-14 21:28:27.272
cmmqu82rt000bnj9knavs6l0k	cmmqu82q40007nj9kn7r3hbn3	prod-cmlz697r20000wagscgomewla-bisagra	0.0000	round({width} / 0.5)	f	5.00	\N	4	2026-03-14 21:28:27.272	2026-03-14 21:28:27.272
cmmqu82rt000cnj9kmlx7tj3d	cmmqu82q40007nj9kn7r3hbn3	prod-cmlz697r20000wagscgomewla-tornilloMad	0.0000	round(({width} + {height}) * 10)	f	10.00	\N	5	2026-03-14 21:28:27.272	2026-03-14 21:28:27.272
\.


--
-- Data for Name: CashClosure; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."CashClosure" (id, "organizationId", "userId", "shiftId", "openingAmount", "closingAmount", "totalCash", "totalCard", "totalTransfer", "totalOther", "countedCash", difference, "totalSales", "totalRefunds", "totalAmount", notes, status, "openedAt", "closedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: CashDrawerShift; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."CashDrawerShift" (id, "organizationId", "userId", status, "openingDate", "closingDate", "openingAmount", "expectedAmount", "actualAmount", "openingNotes", "closingNotes", "totalCashSales", "totalCardSales", "totalTransferSales", "totalSales", "totalPayments", "totalChangeGiven", "transactionCount", "createdAt", "updatedAt") FROM stdin;
cmmsarc77000058gr9x8w95g0	cmlz697r20000wagscgomewla	cmlz6980u0001wagsy7xrc0kl	OPEN	2026-03-15 21:59:06.115	\N	2500.00	\N	\N	\N	\N	0.00	0.00	0.00	0.00	0.00	0.00	0	2026-03-15 21:59:06.115	2026-03-15 21:59:06.115
\.


--
-- Data for Name: Category; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Category" (id, "organizationId", name, description, type, "createdAt", "updatedAt") FROM stdin;
cmlz698bk0003wags2ntcwx26	cmlz697r20000wagscgomewla	Equipos	\N	PRODUCT	2026-02-23 12:47:43.607	2026-02-23 12:47:43.607
cmlz698ja0004wagsf69gktby	cmlz697r20000wagscgomewla	Servicios Cloud	\N	SERVICE	2026-02-23 12:47:43.883	2026-02-23 12:47:43.883
cmlz698qx0005wags8c9ldn8t	cmlz697r20000wagscgomewla	Arriendo	\N	EXPENSE	2026-02-23 12:47:44.161	2026-02-23 12:47:44.161
cat-cmlz697r20000wagscgomewla-windows	cmlz697r20000wagscgomewla	Ventanas	\N	PRODUCT	2026-03-14 21:28:23.806	2026-03-14 21:28:23.806
cat-cmlz697r20000wagscgomewla-raw	cmlz697r20000wagscgomewla	Materia Prima	\N	PRODUCT	2026-03-14 21:28:23.807	2026-03-14 21:28:23.807
cat-cmlz697r20000wagscgomewla-furniture	cmlz697r20000wagscgomewla	Muebles	\N	PRODUCT	2026-03-14 21:28:23.807	2026-03-14 21:28:23.807
\.


--
-- Data for Name: Check; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Check" (id, "organizationId", "bankAccountId", number, type, date, "dueDate", amount, beneficiary, status, notes, "expenseId", "incomeId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Client; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Client" (id, "organizationId", name, email, phone, address, "idNumber", "createdAt", "updatedAt", type) FROM stdin;
cmlz698yf0006wags5u7ro9o0	cmlz697r20000wagscgomewla	Tech Solutions S.A.S	billing@techsolutions.com	\N	Calle 100 # 15-20, Bogotá	901.123.456-1	2026-02-23 12:47:44.429	2026-02-23 12:47:44.429	CLIENT
cmme63w6n0000ce9ksoe5ufgh	cmlz697r20000wagscgomewla	Truper	cosmevasquez3103@gmail.com	45645645645	4645 4 hgf. grf	554645645	2026-03-06 00:40:07.343	2026-03-06 00:40:07.343	PROVIDER
cmme68zvm0000lp9k3lfop3js	cmlz697r20000wagscgomewla	Damian Vasquez	cosmevasquez3103@gmail.com	3463634	346346346	6346346346	2026-03-06 00:44:05.409	2026-03-06 23:23:05.118	CLIENT
cmmfitae20000xxguobxvqd1d	cmlz697r20000wagscgomewla	Yaneri	y@y.com	5465465464	vfd ,dp od b	54645654	2026-03-06 23:23:33.721	2026-03-06 23:23:33.721	CLIENT
cmmfjfl1v0002xxgu1n78m5hr	cmlz697r20000wagscgomewla	Juan Perez	juan@example.com			123456789	2026-03-06 23:40:53.971	2026-03-06 23:40:53.971	CLIENT
cmmfj7him0001xxgulr3a8fsp	cmlz697r20000wagscgomewla	Cliente VIP		56464	5646 46d5f4b6rn rn	999888777	2026-03-06 23:34:36.142	2026-03-06 23:50:20.591	BOTH
cmmulxu5r001s2q9kyyuxomk3	cmlz697r20000wagscgomewla	Juan Pérez	juan.perez@email.com	(809) 555-0101	\N	001-1234567-0	2026-03-17 12:47:37.349	2026-03-17 12:47:37.349	CLIENT
cmmulxufm001t2q9k9e8hhvgs	cmlz697r20000wagscgomewla	María García	maria.garcia@email.com	(809) 555-0202	\N	001-2345678-0	2026-03-17 12:47:37.349	2026-03-17 12:47:37.349	CLIENT
cmmulxug9001u2q9k96n5gqoy	cmlz697r20000wagscgomewla	Carlos López	carlos.lopez@email.com	(809) 555-0303	\N	001-3456789-0	2026-03-17 12:47:37.349	2026-03-17 12:47:37.349	CLIENT
\.


--
-- Data for Name: ClientFiscalData; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."ClientFiscalData" (id, "clientId", "taxId", "fiscalRegime", "contributorType", "addressFiscal", "phoneFiscal", "emailBilling", "dgiiStatus", "agentRetention", "agentPerception", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: CostCenter; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."CostCenter" (id, "organizationId", code, name, description, "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Estimate; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Estimate" (id, "organizationId", number, date, "dueDate", "clientId", subtotal, tax, total, status, notes, "createdAt", "updatedAt") FROM stdin;
cmme4t82k00002h9kuofbw5sw	cmlz697r20000wagscgomewla	COT-30517	2026-03-06 00:00:00	2026-03-20 00:00:00	cmlz698yf0006wags5u7ro9o0	1250.00	0.00	1250.00	ACCEPTED		2026-03-06 00:03:49.863	2026-03-06 00:07:02.411
cmmfk0qnb00006wgubc3u0q2u	cmlz697r20000wagscgomewla	COT-40929	2026-03-06 00:00:00	\N	cmmfj7him0001xxgulr3a8fsp	1250.00	0.00	1250.00	DRAFT		2026-03-06 23:57:20.999	2026-03-06 23:57:20.999
cmmfk1aox00026wgu3hzbd9wg	cmlz697r20000wagscgomewla	COT-61569	2026-03-06 00:00:00	\N	cmme68zvm0000lp9k3lfop3js	12500.00	0.00	12500.00	DRAFT		2026-03-06 23:57:46.977	2026-03-07 00:00:08.625
\.


--
-- Data for Name: EstimateItem; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."EstimateItem" (id, "estimateId", "productId", description, quantity, price, total) FROM stdin;
cmme4towl00022h9kxj9vvebn	cmme4t82k00002h9kuofbw5sw	cmlz699dt0008wagsjxhvy7tc	Laptop Dell XPS 13	1	1250.00	1250.00
cmmfk0qqf00016wgu49rw4ehl	cmmfk0qnb00006wgubc3u0q2u	cmlz699dt0008wagsjxhvy7tc	Laptop Dell XPS 13	1	1250.00	1250.00
cmmfk4c1y00066wgu6ecjr5mq	cmmfk1aox00026wgu3hzbd9wg	cmlz699dt0008wagsjxhvy7tc	Laptop Dell XPS 13	10	1250.00	12500.00
\.


--
-- Data for Name: ExchangeRateAdjustment; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."ExchangeRateAdjustment" (id, "organizationId", date, period, "totalDebit", "totalCredit", difference, "journalEntryId", status, notes, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Expense; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Expense" (id, "organizationId", number, date, provider, description, "categoryId", total, status, "createdAt", "updatedAt", "journalEntryId", type, "costCenterId") FROM stdin;
cmlz699v3000bwagswf6wcujl	cmlz697r20000wagscgomewla	G-541	2026-02-23 12:47:45.602	Inmobiliaria Central	\N	cmlz698qx0005wags8c9ldn8t	2100.00	PAID	2026-02-23 12:47:45.607	2026-02-23 12:47:45.607	\N	EXPENSE	\N
cmmfjtgs70000rrgu09b9prmr	cmlz697r20000wagscgomewla	COMP-24195	2026-03-06 00:00:00	Cliente VIP	\N	cmlz698bk0003wags2ntcwx26	1250.00	PAID	2026-03-06 23:51:41.623	2026-03-06 23:51:41.623	\N	EXPENSE	\N
cmmfk59qk00076wgupl0dgb4j	cmlz697r20000wagscgomewla	COMP-42936	2026-03-07 00:00:00	Cliente VIP	\N	cmlz698bk0003wags2ntcwx26	1250.00	PAID	2026-03-07 00:00:52.364	2026-03-07 00:00:52.364	\N	EXPENSE	\N
cmmmswnwl000eqt9k5hu2l5mr	cmlz697r20000wagscgomewla	COMP-16210	2026-03-12 00:00:00	Cliente VIP	\N	cmlz698bk0003wags2ntcwx26	1250.00	PENDING	2026-03-12 01:40:30.597	2026-03-12 01:40:30.597	\N	EXPENSE	\N
cmmmt53fs000gqt9kk219o6k7	cmlz697r20000wagscgomewla	COMP-69291	2026-03-12 00:00:00	Truper	\N	cmlz698bk0003wags2ntcwx26	12500.00	PENDING	2026-03-12 01:47:03.976	2026-03-12 01:47:03.976	\N	EXPENSE	\N
cmmmt5mlh000iqt9kcvjqbo75	cmlz697r20000wagscgomewla	COMP-75928	2026-03-12 00:00:00	Truper	\N	cmlz698bk0003wags2ntcwx26	1250.00	PAID	2026-03-12 01:47:28.805	2026-03-12 01:47:29.908	cmmmt5n8t000kqt9k7h2n4ro1	EXPENSE	\N
cmmmtbhos000oqt9koqwh8wj4	cmlz697r20000wagscgomewla	COMP-37293	2026-03-12 00:00:00	Truper	\N	cmlz698bk0003wags2ntcwx26	3400.00	PAID	2026-03-12 01:52:02.38	2026-03-12 01:52:03.539	cmmmtbieq000qqt9k7vrpayq1	EXPENSE	\N
cmmmtder0000uqt9kpewhcjhv	cmlz697r20000wagscgomewla	COMP-14622	2026-03-12 00:00:00	Truper	\N	cmlz698bk0003wags2ntcwx26	1250.00	PENDING	2026-03-12 01:53:31.884	2026-03-12 01:53:31.884	\N	EXPENSE	\N
cmme6ny0f0001lp9k69pm53ph	cmlz697r20000wagscgomewla	COMP-76179	2026-03-06 00:00:00	Damian Vasquez	\N	cmlz698bk0003wags2ntcwx26	125000.00	PENDING	2026-03-06 00:55:42.83	2026-03-12 02:11:32.479	\N	EXPENSE	\N
\.


--
-- Data for Name: ExpenseItem; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."ExpenseItem" (id, "expenseId", "productId", description, quantity, price, total) FROM stdin;
cmme6ny210002lp9k9363dntt	cmme6ny0f0001lp9k69pm53ph	cmlz699dt0008wagsjxhvy7tc	Laptop Dell XPS 13	100	1250.00	125000.00
cmmfjtgvk0001rrgukhycojly	cmmfjtgs70000rrgu09b9prmr	cmlz699dt0008wagsjxhvy7tc	Laptop Dell XPS 13	1	1250.00	1250.00
cmmfk59s500086wguv002h0ct	cmmfk59qk00076wgupl0dgb4j	cmlz699dt0008wagsjxhvy7tc	Laptop Dell XPS 13	1	1250.00	1250.00
cmmmswnzy000fqt9kij6zc7a7	cmmmswnwl000eqt9k5hu2l5mr	cmlz699dt0008wagsjxhvy7tc	Laptop Dell XPS 13	1	1250.00	1250.00
cmmmt53hl000hqt9kxghhm5uh	cmmmt53fs000gqt9kk219o6k7	cmlz699dt0008wagsjxhvy7tc	Laptop Dell XPS 13	10	1250.00	12500.00
cmmmt5mn5000jqt9kkimsdfy0	cmmmt5mlh000iqt9kcvjqbo75	cmlz699dt0008wagsjxhvy7tc	Laptop Dell XPS 13	1	1250.00	1250.00
cmmmtbhrk000pqt9kbuipb3ij	cmmmtbhos000oqt9koqwh8wj4	cmlz6996h0007wagsa4rqslxf	Servicios Cloud AWS	10	340.00	3400.00
cmmmtdesn000vqt9kifcf6emf	cmmmtder0000uqt9kpewhcjhv	cmlz699dt0008wagsjxhvy7tc	Laptop Dell XPS 13	1	1250.00	1250.00
\.


--
-- Data for Name: FixedAsset; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."FixedAsset" (id, "organizationId", "categoryId", code, name, description, location, "responsibleId", "acquisitionDate", "acquisitionCost", "salvageValue", "usefulLifeYears", "depreciationMethod", "depreciationStartDate", status, "invoiceId", notes, "currentValue", "accumulatedDepreciation", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Income; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Income" (id, "organizationId", number, date, description, "clientId", "categoryId", amount, "paymentMethod", reference, status, "bankAccountId", "createdAt", "updatedAt", "costCenterId") FROM stdin;
\.


--
-- Data for Name: InventoryMovement; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."InventoryMovement" (id, "organizationId", "productId", type, quantity, "unitCost", "totalCost", reference, "sourceType", "sourceId", notes, "createdAt") FROM stdin;
cmmpb2ql00002x59kxb9vtch6	cmlz697r20000wagscgomewla	cmmfjgbiq0003xxgu2nzut5mr	SALE	1	0.00	0.00	POS-MMPB2OTB	INVOICE	cmmpb2qch0000x59kmsj3m8cn	\N	2026-03-13 19:44:39.444
cmmpb2ri90009x59k26vlief1	cmlz697r20000wagscgomewla	cmmfjgbiq0003xxgu2nzut5mr	SALE	1	0.00	0.00	POS-MMPB2QX2	INVOICE	cmmpb2r9y0007x59ki7p2ewrj	\N	2026-03-13 19:44:40.641
cmmpbf8hz000gx59kut6zdhdt	cmlz697r20000wagscgomewla	cmlz6996h0007wagsa4rqslxf	SALE	1	0.00	0.00	POS-MMPBF7S7	INVOICE	cmmpbf8af000ex59kie34np6y	\N	2026-03-13 19:54:22.535
cmmpbm8rx000nx59kw2bowmq2	cmlz697r20000wagscgomewla	cmmfjgbiq0003xxgu2nzut5mr	SALE	1	0.00	0.00	POS-MMPBM7BC	INVOICE	cmmpbm8in000lx59ks5naii0m	\N	2026-03-13 19:59:49.485
cmmpbnsi7000ux59ks5ufdfea	cmlz697r20000wagscgomewla	cmlz6996h0007wagsa4rqslxf	SALE	1	0.00	0.00	POS-MMPBNRUR	INVOICE	cmmpbnsai000sx59khjjq8a46	\N	2026-03-13 20:01:01.711
cmmpbscx10011x59kyu9hkln6	cmlz697r20000wagscgomewla	cmmfjgbiq0003xxgu2nzut5mr	SALE	1	0.00	0.00	POS-MMPBSC3W	INVOICE	cmmpbscnv000zx59k5gst47ct	\N	2026-03-13 20:04:34.789
cmmpbu1wr0018x59kei3vwks6	cmlz697r20000wagscgomewla	cmmfjgbiq0003xxgu2nzut5mr	SALE	1	0.00	0.00	POS-MMPBU14E	INVOICE	cmmpbu1ox0016x59kzm0i55en	\N	2026-03-13 20:05:53.835
cmmpbzz61001fx59kn6wrg5tn	cmlz697r20000wagscgomewla	cmmfjgbiq0003xxgu2nzut5mr	SALE	1	0.00	0.00	POS-MMPBZYK4	INVOICE	cmmpbzyx8001dx59kvljzl87p	\N	2026-03-13 20:10:30.216
cmmpc74mi001mx59k9mbf0whe	cmlz697r20000wagscgomewla	cmlz6996h0007wagsa4rqslxf	SALE	1	0.00	0.00	POS-MMPC73SD	INVOICE	cmmpc74ea001kx59kgr2i6tib	\N	2026-03-13 20:16:03.881
cmmpci6js001tx59kdmyazhkr	cmlz697r20000wagscgomewla	cmmfjgbiq0003xxgu2nzut5mr	SALE	1	0.00	0.00	POS-MMPCI5WQ	INVOICE	cmmpci6c1001rx59kh0qpev5b	\N	2026-03-13 20:24:39.592
cmmpcnsik0020x59kuyng7mzp	cmlz697r20000wagscgomewla	cmlz6996h0007wagsa4rqslxf	SALE	1	0.00	0.00	POS-MMPCNRXU	INVOICE	cmmpcnsb2001yx59kbqjptjlu	\N	2026-03-13 20:29:01.34
cmmpcwypn0027x59kkk1uv1x2	cmlz697r20000wagscgomewla	cmlz6996h0007wagsa4rqslxf	SALE	1	0.00	0.00	POS-MMPCWY0Y	INVOICE	cmmpcwygm0025x59kyd2u65zk	\N	2026-03-13 20:36:09.275
cmmpcyoe0002fx59k8sye5anz	cmlz697r20000wagscgomewla	cmlz699dt0008wagsjxhvy7tc	SALE	1	0.00	0.00	POS-MMPCYNNO	INVOICE	cmmpcyo6p002cx59k1teqkae0	\N	2026-03-13 20:37:29.208
cmmpcyoij002gx59k6wrx6v0y	cmlz697r20000wagscgomewla	cmlz6996h0007wagsa4rqslxf	SALE	2	0.00	0.00	POS-MMPCYNNO	INVOICE	cmmpcyo6p002cx59k1teqkae0	\N	2026-03-13 20:37:29.371
cmmpjguos0003dw9ktbjf3fyx	cmlz697r20000wagscgomewla	cmlz6996h0007wagsa4rqslxf	SALE	1	0.00	0.00	POS-MMPJGU05	INVOICE	cmmpjguge0000dw9k09po4odp	\N	2026-03-13 23:39:34.876
cmmpjgutq0004dw9kkde4fogb	cmlz697r20000wagscgomewla	cmlz699dt0008wagsjxhvy7tc	SALE	1	0.00	0.00	POS-MMPJGU05	INVOICE	cmmpjguge0000dw9k09po4odp	\N	2026-03-13 23:39:35.054
cmmpkd9w1000bdw9kkpvenlpz	cmlz697r20000wagscgomewla	cmmfjgbiq0003xxgu2nzut5mr	SALE	1	0.00	0.00	POS-MMPKD8G2	INVOICE	cmmpkd9mw0009dw9kst9n4360	\N	2026-03-14 00:04:47.569
cmmpkvggx000idw9kwedm5npc	cmlz697r20000wagscgomewla	cmmfjgbiq0003xxgu2nzut5mr	SALE	1	0.00	0.00	POS-MMPKVFCF	INVOICE	cmmpkvg95000gdw9kd2f5lwj9	\N	2026-03-14 00:18:55.905
cmmplai2z0003639knevbvw3a	cmlz697r20000wagscgomewla	cmlz6996h0007wagsa4rqslxf	SALE	1	0.00	0.00	POS-MMPLAHCD	INVOICE	cmmplahun0001639kncsv1f2s	\N	2026-03-14 00:30:37.835
cmmplgkap00023r9kz6guajdw	cmlz697r20000wagscgomewla	cmmfjgbiq0003xxgu2nzut5mr	SALE	1	0.00	0.00	POS-MMPLGJJO	INVOICE	cmmplgk3400003r9k15hhi4hk	\N	2026-03-14 00:35:20.641
cmmpli6j6000a3r9k4n29pg48	cmlz697r20000wagscgomewla	cmlz6996h0007wagsa4rqslxf	SALE	2	0.00	0.00	POS-MMPLI5WY	INVOICE	cmmpli6bf00083r9kxbopmg56	\N	2026-03-14 00:36:36.114
cmmplim14000h3r9k700sw7gu	cmlz697r20000wagscgomewla	cmlz6996h0007wagsa4rqslxf	SALE	1	0.00	0.00	POS-MMPLILER	INVOICE	cmmplilth000f3r9ky1ups37n	\N	2026-03-14 00:36:56.2
cmmplnsq30003vl9ky9lvh7zs	cmlz697r20000wagscgomewla	cmlz6996h0007wagsa4rqslxf	SALE	1	0.00	0.00	POS-MMPLNRMC	INVOICE	cmmplnsfq0001vl9kwsjwzdw1	\N	2026-03-14 00:40:58.155
cmmpluy8i0002uo9kyd1g6va4	cmlz697r20000wagscgomewla	cmlz6996h0007wagsa4rqslxf	SALE	1	0.00	0.00	POS-MMPLUWV1	INVOICE	cmmpluxtq0000uo9khr5oug1o	\N	2026-03-14 00:46:31.89
cmmpm3y2o0003kf9kjmqqqgld	cmlz697r20000wagscgomewla	cmlz699dt0008wagsjxhvy7tc	SALE	1	0.00	0.00	POS-MMPM3XDD	INVOICE	cmmpm3xuw0000kf9ktv52lh75	\N	2026-03-14 00:53:31.584
cmmpm3y780004kf9kugipcf95	cmlz697r20000wagscgomewla	cmlz6996h0007wagsa4rqslxf	SALE	1	0.00	0.00	POS-MMPM3XDD	INVOICE	cmmpm3xuw0000kf9ktv52lh75	\N	2026-03-14 00:53:31.748
cmmqoa58j00004k9kuu2jah8l	cmlz697r20000wagscgomewla	cmlz699dt0008wagsjxhvy7tc	PURCHASE	100	25000.00	2500000.00	10000-0254	\N	\N	\N	2026-03-14 18:42:06.21
cmmqoemz500034k9kt366zvqz	cmlz697r20000wagscgomewla	cmlz6996h0007wagsa4rqslxf	SALE	1	0.00	0.00	POS-MMQOEM4W	INVOICE	cmmqoemqd00014k9kzeb2u9eh	\N	2026-03-14 18:45:35.825
cmmqorh0y000a4k9kyinq9t9s	cmlz697r20000wagscgomewla	cmlz699dt0008wagsjxhvy7tc	SALE	1	0.00	0.00	POS-MMQORGK6	INVOICE	cmmqorgqh00084k9kso4q03lj	\N	2026-03-14 18:55:34.642
cmmqos1t2000h4k9kj9r60zxc	cmlz697r20000wagscgomewla	cmlz699dt0008wagsjxhvy7tc	SALE	2	0.00	0.00	POS-MMQOS1AV	INVOICE	cmmqos1gu000f4k9kt3i0as9g	\N	2026-03-14 18:56:01.574
cmmqpafm50002dd9k3it27zh7	cmlz697r20000wagscgomewla	cmlz699dt0008wagsjxhvy7tc	SALE	1	0.00	0.00	POS-MMQPAF4X	INVOICE	cmmqpafcy0000dd9kmfm1w6md	\N	2026-03-14 19:10:19.277
cmmqpanid0009dd9kzd32inh4	cmlz697r20000wagscgomewla	cmlz699dt0008wagsjxhvy7tc	SALE	3	0.00	0.00	POS-MMQPAN3C	INVOICE	cmmqpan790007dd9kuit8vqu9	\N	2026-03-14 19:10:29.509
cmmqpbnlw000hdd9kq4ccz6do	cmlz697r20000wagscgomewla	cmlz699dt0008wagsjxhvy7tc	SALE	3	0.00	0.00	POS-MMQPBN9C	INVOICE	cmmqpbne9000edd9k9uf9noy1	\N	2026-03-14 19:11:16.292
cmmqpbnto000idd9k4c3z2gyc	cmlz697r20000wagscgomewla	cmlz6996h0007wagsa4rqslxf	SALE	1	0.00	0.00	POS-MMQPBN9C	INVOICE	cmmqpbne9000edd9k9uf9noy1	\N	2026-03-14 19:11:16.572
cmmqphdc4000pdd9kaghue8mo	cmlz697r20000wagscgomewla	cmlz699dt0008wagsjxhvy7tc	SALE	1	0.00	0.00	POS-MMQPHCYX	INVOICE	cmmqphd2t000ndd9khq1ck86s	\N	2026-03-14 19:15:42.916
cmmqpqj5l000wdd9kcmorwxjk	cmlz697r20000wagscgomewla	cmlz699dt0008wagsjxhvy7tc	SALE	1	0.00	0.00	POS-MMQPQIR1	INVOICE	cmmqpqiv3000udd9ktre20xxo	\N	2026-03-14 19:22:50.361
cmmqpuset0013dd9kajaebdn2	cmlz697r20000wagscgomewla	cmlz699dt0008wagsjxhvy7tc	SALE	1	0.00	0.00	POS-MMQPUS07	INVOICE	cmmqpus410011dd9k4wri6z4j	\N	2026-03-14 19:26:08.981
cmmqpxzxg001bdd9kt9qxz06m	cmlz697r20000wagscgomewla	cmlz6996h0007wagsa4rqslxf	SALE	1	0.00	0.00	POS-MMQPXZI3	INVOICE	cmmqpxzn70019dd9kcx94fvts	\N	2026-03-14 19:28:38.692
cmmqscd5d000209l4oycjcv6x	cmlz697r20000wagscgomewla	cmlz699dt0008wagsjxhvy7tc	SALE	1	0.00	0.00	POS-MMQSCCTW	INVOICE	cmmqscd31000009l4mjqdp01y	\N	2026-03-14 20:35:48.241
cmms5q2we0002jpgrymck93i7	cmlz697r20000wagscgomewla	prod-cmlz697r20000wagscgomewla-bisagra	SALE	1	18.00	18.00	POS-MMS5Q2A3	INVOICE	cmms5q2nc0000jpgrb7yf72nd	\N	2026-03-15 19:38:09.326
cmms6cwk0000gjpgrczmdwnv9	cmlz697r20000wagscgomewla	prod-cmlz697r20000wagscgomewla-bisagra	SALE	1	18.00	18.00	POS-MMS6CW7T	INVOICE	cmms6cwc7000ejpgr7kghcnla	\N	2026-03-15 19:55:54.192
cmms6rfs7000pjpgr3j7ispxl	cmlz697r20000wagscgomewla	prod-cmlz697r20000wagscgomewla-bisagra	SALE	1	18.00	18.00	POS-MMS6RDXT	INVOICE	cmms6rfep000njpgrr2hfes0q	\N	2026-03-15 20:07:12.295
cmms6zyrx000wjpgrabjybtqd	cmlz697r20000wagscgomewla	prod-cmlz697r20000wagscgomewla-bisagra	SALE	1	18.00	18.00	POS-MMS6ZXOP	INVOICE	cmms6zy4i000ujpgrnkmp9i51	\N	2026-03-15 20:13:50.157
\.


--
-- Data for Name: InventoryWarehouse; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."InventoryWarehouse" (id, "productId", "warehouseId", quantity) FROM stdin;
\.


--
-- Data for Name: Invoice; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Invoice" (id, "organizationId", number, date, "dueDate", "clientId", subtotal, tax, total, status, "createdAt", "updatedAt", "journalEntryId", "costCenterId") FROM stdin;
cmlz699lu0009wags9kfe0i6q	cmlz697r20000wagscgomewla	FE-1024	2026-02-23 12:47:45.267	\N	cmlz698yf0006wags5u7ro9o0	1250.00	237.50	1487.50	PAID	2026-02-23 12:47:45.274	2026-02-23 12:47:45.274	\N	\N
cmlz6ep13000009l8bcvhwbex	cmlz697r20000wagscgomewla	POS-CPYEJM	2026-02-23 12:51:57.288	\N	cmlz698yf0006wags5u7ro9o0	285.71	54.29	340.00	PAID	2026-02-23 12:51:58.63	2026-02-23 12:51:58.63	\N	\N
cmlz6frlb000209l89kry8u76	cmlz697r20000wagscgomewla	POS-DIHSG3	2026-02-23 12:52:47.854	\N	cmlz698yf0006wags5u7ro9o0	285.71	54.29	340.00	PAID	2026-02-23 12:52:48.608	2026-02-23 12:52:48.608	\N	\N
cmmpbzyx8001dx59kvljzl87p	cmlz697r20000wagscgomewla	POS-MMPBZYK4	2026-03-13 20:10:29.428	\N	cmmfj7him0001xxgulr3a8fsp	42.37	7.63	50.00	PAID	2026-03-13 20:10:29.9	2026-03-13 20:10:30.988	cmmpbzzk6001gx59kiwbt7x68	\N
cmme3xe6y0000kd9kghi6mf62	cmlz697r20000wagscgomewla	FE-8218	2026-03-05 00:00:00	\N	cmlz698yf0006wags5u7ro9o0	1590.00	302.10	1892.10	DRAFT	2026-03-05 23:39:04.804	2026-03-05 23:48:36.906	\N	\N
cmme4h5yt00049c9knbivtpb8	cmlz697r20000wagscgomewla	POS-Y1CIGS	2026-03-05 23:54:26.643	\N	cmlz698yf0006wags5u7ro9o0	1142.86	217.14	1360.00	PAID	2026-03-05 23:54:27.263	2026-03-05 23:54:27.263	\N	\N
cmme4j4e300069c9k4i17i8fp	cmlz697r20000wagscgomewla	POS-B22EGR	2026-03-05 23:55:58.365	\N	cmlz698yf0006wags5u7ro9o0	1142.86	217.14	1360.00	PAID	2026-03-05 23:55:58.509	2026-03-05 23:55:58.509	\N	\N
cmme4xcgb00032h9kjdjpxeds	cmlz697r20000wagscgomewla	INV-30517	2026-03-06 00:07:02.216	\N	cmlz698yf0006wags5u7ro9o0	1250.00	0.00	1250.00	DRAFT	2026-03-06 00:07:02.219	2026-03-06 00:07:02.219	\N	\N
cmme5aiox00052h9kcj5usafq	cmlz697r20000wagscgomewla	FE-3975	2026-03-06 00:00:00	\N	cmlz698yf0006wags5u7ro9o0	3750.00	712.50	4462.50	DRAFT	2026-03-06 00:17:16.832	2026-03-06 00:17:16.832	\N	\N
cmmedzxi8000009l2lul0i1sy	cmlz697r20000wagscgomewla	POS-MT9HQJ	2026-03-06 04:20:58.964	\N	cmme68zvm0000lp9k3lfop3js	1336.13	253.87	1590.00	PAID	2026-03-06 04:20:59.36	2026-03-06 04:20:59.36	\N	\N
cmmfk703100096wgu8wxs31us	cmlz697r20000wagscgomewla	POS-425GQY	2026-03-07 00:02:12.548	\N	cmmfj7him0001xxgulr3a8fsp	13655.46	2594.54	16250.00	PAID	2026-03-07 00:02:13.165	2026-03-07 00:02:13.165	\N	\N
cmmmpm3xd0000py9k4rlxcixx	cmlz697r20000wagscgomewla	POS-ZFDNUP	2026-03-12 00:08:18.983	\N	cmmfj7him0001xxgulr3a8fsp	1050.42	199.58	1250.00	PAID	2026-03-12 00:08:19.297	2026-03-12 00:08:19.297	\N	\N
cmmms0eji0000qt9kvby4w05d	cmlz697r20000wagscgomewla	POS-ZAPA39	2026-03-12 01:15:24.725	\N	cmmfj7him0001xxgulr3a8fsp	3151.26	598.74	3750.00	PAID	2026-03-12 01:15:25.47	2026-03-12 01:15:25.47	\N	\N
cmmms9ceg0002qt9kfrmw16tu	cmlz697r20000wagscgomewla	POS-0JMWSX	2026-03-12 01:22:19.628	\N	cmmfj7him0001xxgulr3a8fsp	8474.58	1525.42	10000.00	PAID	2026-03-12 01:22:22.6	2026-03-12 01:22:23.664	cmmms9czx0004qt9k7pj1l26s	\N
cmmmsk1aa0008qt9kwvra8p6m	cmlz697r20000wagscgomewla	POS-2QLH5Y	2026-03-12 01:30:40.606	\N	cmmfj7him0001xxgulr3a8fsp	288.14	51.86	340.00	PAID	2026-03-12 01:30:41.41	2026-03-12 01:30:42.538	cmmmsk1ts000aqt9kubvcvgtn	\N
cmmmvo1950000ui9kra1bl7k1	cmlz697r20000wagscgomewla	FE-6223	2026-03-12 00:00:00	\N	cmme68zvm0000lp9k3lfop3js	1250.00	237.50	1487.50	SENT	2026-03-12 02:57:46.452	2026-03-12 02:57:47.721	cmmmvo1r80002ui9krksry46n	\N
cmmmvp6si0006ui9kclovtf8y	cmlz697r20000wagscgomewla	FE-8628	2026-03-12 00:00:00	2026-03-20 00:00:00	cmlz698yf0006wags5u7ro9o0	1250.00	237.50	1487.50	PARTIAL	2026-03-12 02:58:40.208	2026-03-12 02:59:29.007	cmmmvp79t0008ui9k4mz2gy3m	\N
cmmpb2qch0000x59kmsj3m8cn	cmlz697r20000wagscgomewla	POS-MMPB2OTB	2026-03-13 19:44:37.151	\N	cmme68zvm0000lp9k3lfop3js	42.37	7.63	50.00	PAID	2026-03-13 19:44:39.137	2026-03-13 19:44:40.214	cmmpb2qzy0003x59kb8yskmx4	\N
cmmpb2r9y0007x59ki7p2ewrj	cmlz697r20000wagscgomewla	POS-MMPB2QX2	2026-03-13 19:44:39.878	\N	cmme68zvm0000lp9k3lfop3js	42.37	7.63	50.00	PAID	2026-03-13 19:44:40.342	2026-03-13 19:44:41.394	cmmpb2rx9000ax59k7jsl4u08	\N
cmmpbf8af000ex59kie34np6y	cmlz697r20000wagscgomewla	POS-MMPBF7S7	2026-03-13 19:54:21.607	\N	cmmfj7him0001xxgulr3a8fsp	288.14	51.86	340.00	PAID	2026-03-13 19:54:22.263	2026-03-13 19:54:23.265	cmmpbf8w5000hx59kx529o01p	\N
cmmpbm8in000lx59ks5naii0m	cmlz697r20000wagscgomewla	POS-MMPBM7BC	2026-03-13 19:59:47.592	\N	cmmfj7him0001xxgulr3a8fsp	42.37	7.63	50.00	PAID	2026-03-13 19:59:49.15	2026-03-13 19:59:50.284	cmmpbm97q000ox59km189ugcw	\N
cmmpbnsai000sx59khjjq8a46	cmlz697r20000wagscgomewla	POS-MMPBNRUR	2026-03-13 20:01:00.867	\N	cmmfj7him0001xxgulr3a8fsp	288.14	51.86	340.00	PAID	2026-03-13 20:01:01.434	2026-03-13 20:01:02.443	cmmpbnswb000vx59kihxs0fzm	\N
cmmpbscnv000zx59k5gst47ct	cmlz697r20000wagscgomewla	POS-MMPBSC3W	2026-03-13 20:04:33.74	\N	cmmfj7him0001xxgulr3a8fsp	42.37	7.63	50.00	PAID	2026-03-13 20:04:34.458	2026-03-13 20:04:35.574	cmmpbsdcn0012x59k9hkjlwst	\N
cmmpbu1ox0016x59kzm0i55en	cmlz697r20000wagscgomewla	POS-MMPBU14E	2026-03-13 20:05:52.814	\N	cmmfj7him0001xxgulr3a8fsp	42.37	7.63	50.00	PAID	2026-03-13 20:05:53.553	2026-03-13 20:05:54.578	cmmpbu2bf0019x59kqsjop5m6	\N
cmmpc74ea001kx59kgr2i6tib	cmlz697r20000wagscgomewla	POS-MMPC73SD	2026-03-13 20:16:02.797	\N	cmmfj7him0001xxgulr3a8fsp	288.14	51.86	340.00	PAID	2026-03-13 20:16:03.585	2026-03-13 20:16:04.659	cmmpc751g001nx59kgzazt7l0	\N
cmmpci6c1001rx59kh0qpev5b	cmlz697r20000wagscgomewla	POS-MMPCI5WQ	2026-03-13 20:24:38.762	\N	cmmfj7him0001xxgulr3a8fsp	42.37	7.63	50.00	PAID	2026-03-13 20:24:39.313	2026-03-13 20:24:40.342	cmmpci6yc001ux59k319lrywj	\N
cmmpcnsb2001yx59kbqjptjlu	cmlz697r20000wagscgomewla	POS-MMPCNRXU	2026-03-13 20:29:00.594	\N	cmmfj7him0001xxgulr3a8fsp	288.14	51.86	340.00	PAID	2026-03-13 20:29:01.07	2026-03-13 20:29:02.075	cmmpcnswc0021x59klfq5991x	\N
cmmpcwygm0025x59kyd2u65zk	cmlz697r20000wagscgomewla	POS-MMPCWY0Y	2026-03-13 20:36:08.386	\N	cmmfj7him0001xxgulr3a8fsp	288.14	51.86	340.00	PAID	2026-03-13 20:36:08.95	2026-03-13 20:36:10.073	cmmpcwz4y0028x59kpge2zfjj	\N
cmmpcyo6p002cx59k1teqkae0	cmlz697r20000wagscgomewla	POS-MMPCYNNO	2026-03-13 20:37:28.26	\N	cmmfj7him0001xxgulr3a8fsp	1635.59	294.41	1930.00	PAID	2026-03-13 20:37:28.945	2026-03-13 20:37:30.077	cmmpcyowc002hx59kt4j03yfv	\N
cmmpjguge0000dw9k09po4odp	cmlz697r20000wagscgomewla	POS-MMPJGU05	2026-03-13 23:39:33.989	\N	cmmfjfl1v0002xxgu1n78m5hr	1347.46	242.54	1590.00	PAID	2026-03-13 23:39:34.574	2026-03-13 23:39:36.049	cmmpjgver0005dw9kz2dqt7ox	\N
cmmpkd9mw0009dw9kst9n4360	cmlz697r20000wagscgomewla	POS-MMPKD8G2	2026-03-14 00:04:45.698	\N	cmmfj7him0001xxgulr3a8fsp	42.37	7.63	50.00	PAID	2026-03-14 00:04:47.24	2026-03-14 00:04:48.459	cmmpkdadn000cdw9kmg9yrthj	\N
cmmpkvg95000gdw9kd2f5lwj9	cmlz697r20000wagscgomewla	POS-MMPKVFCF	2026-03-14 00:18:54.447	\N	cmmfj7him0001xxgulr3a8fsp	42.37	7.63	50.00	PAID	2026-03-14 00:18:55.625	2026-03-14 00:18:56.669	cmmpkvgw0000jdw9kk3178aj0	\N
cmmplahun0001639kncsv1f2s	cmlz697r20000wagscgomewla	POS-MMPLAHCD	2026-03-14 00:30:36.877	\N	cmmfj7him0001xxgulr3a8fsp	288.14	51.86	340.00	PAID	2026-03-14 00:30:37.535	2026-03-14 00:30:38.767	cmmplailc0004639kv6z7ydbe	\N
cmmplgk3400003r9k15hhi4hk	cmlz697r20000wagscgomewla	POS-MMPLGJJO	2026-03-14 00:35:19.668	\N	cmmfj7him0001xxgulr3a8fsp	42.37	7.63	50.00	PAID	2026-03-14 00:35:20.368	2026-03-14 00:35:22.268	cmmplgl3p00033r9kpp2bgw2r	\N
cmmpli6bf00083r9kxbopmg56	cmlz697r20000wagscgomewla	POS-MMPLI5WY	2026-03-14 00:36:35.314	\N	cmme68zvm0000lp9k3lfop3js	576.27	103.73	680.00	PAID	2026-03-14 00:36:35.835	2026-03-14 00:36:36.871	cmmpli6xu000b3r9kl8iqg79s	\N
cmmplilth000f3r9ky1ups37n	cmlz697r20000wagscgomewla	POS-MMPLILER	2026-03-14 00:36:55.395	\N	cmme68zvm0000lp9k3lfop3js	288.14	51.86	340.00	PAID	2026-03-14 00:36:55.925	2026-03-14 00:36:56.954	cmmplimfu000i3r9kf8afrcaz	\N
cmmplnsfq0001vl9kwsjwzdw1	cmlz697r20000wagscgomewla	POS-MMPLNRMC	2026-03-14 00:40:56.724	\N	cmme68zvm0000lp9k3lfop3js	288.14	51.86	340.00	PAID	2026-03-14 00:40:57.782	2026-03-14 00:40:58.924	cmmplnt5h0004vl9kheugzsn2	\N
cmmpluxtq0000uo9khr5oug1o	cmlz697r20000wagscgomewla	POS-MMPLUWV1	2026-03-14 00:46:30.109	\N	cmme68zvm0000lp9k3lfop3js	288.14	51.86	340.00	SENT	2026-03-14 00:46:31.358	2026-03-14 00:46:33.544	cmmpluz3t0003uo9kncc3fut3	\N
cmmpm3xuw0000kf9ktv52lh75	cmlz697r20000wagscgomewla	POS-MMPM3XDD	2026-03-14 00:53:30.673	\N	cmme68zvm0000lp9k3lfop3js	1347.46	242.54	1590.00	SENT	2026-03-14 00:53:31.303	2026-03-14 00:53:32.689	cmmpm3yr80005kf9k17vzulgu	\N
cmmqoemqd00014k9kzeb2u9eh	cmlz697r20000wagscgomewla	POS-MMQOEM4W	2026-03-14 18:45:34.736	\N	cmme68zvm0000lp9k3lfop3js	288.14	51.86	340.00	SENT	2026-03-14 18:45:35.509	2026-03-14 18:45:36.669	cmmqoeng400044k9km73oekx8	\N
cmmqorgqh00084k9kso4q03lj	cmlz697r20000wagscgomewla	POS-MMQORGK6	2026-03-14 18:55:34.038	\N	cmme68zvm0000lp9k3lfop3js	1059.32	190.68	1250.00	SENT	2026-03-14 18:55:34.264	2026-03-14 18:55:36.119	cmmqorhxn000b4k9k109fwq7v	\N
cmmqos1gu000f4k9kt3i0as9g	cmlz697r20000wagscgomewla	POS-MMQOS1AV	2026-03-14 18:56:00.919	\N	cmme68zvm0000lp9k3lfop3js	2118.64	381.36	2500.00	SENT	2026-03-14 18:56:01.133	2026-03-14 18:56:02.87	cmmqos2ii000i4k9klgm4j87a	\N
cmmqpafcy0000dd9kmfm1w6md	cmlz697r20000wagscgomewla	POS-MMQPAF4X	2026-03-14 19:10:18.657	\N	cmme68zvm0000lp9k3lfop3js	1059.32	190.68	1250.00	SENT	2026-03-14 19:10:18.946	2026-03-14 19:10:20.184	cmmqpag3h0003dd9knibmkkel	\N
cmmqpan790007dd9kuit8vqu9	cmlz697r20000wagscgomewla	POS-MMQPAN3C	2026-03-14 19:10:28.968	\N	cmme68zvm0000lp9k3lfop3js	3177.97	572.03	3750.00	SENT	2026-03-14 19:10:29.109	2026-03-14 19:10:30.417	cmmqpanxh000add9kjs6afsx3	\N
cmmqpbne9000edd9k9uf9noy1	cmlz697r20000wagscgomewla	POS-MMQPBN9C	2026-03-14 19:11:15.84	\N	cmme68zvm0000lp9k3lfop3js	3466.10	623.90	4090.00	SENT	2026-03-14 19:11:16.017	2026-03-14 19:11:17.355	cmmqpbo8g000jdd9kmalp4p63	\N
cmmqphd2t000ndd9khq1ck86s	cmlz697r20000wagscgomewla	POS-MMQPHCYX	2026-03-14 19:15:42.441	\N	cmme68zvm0000lp9k3lfop3js	1059.32	190.68	1250.00	SENT	2026-03-14 19:15:42.581	2026-03-14 19:15:43.698	cmmqphdqu000qdd9kbidirpoe	\N
cmmqpqiv3000udd9ktre20xxo	cmlz697r20000wagscgomewla	POS-MMQPQIR1	2026-03-14 19:22:49.837	\N	cmme68zvm0000lp9k3lfop3js	1059.32	190.68	1250.00	SENT	2026-03-14 19:22:49.983	2026-03-14 19:22:51.446	cmmqpqjqf000xdd9kec5klfu8	\N
cmmqpus410011dd9k4wri6z4j	cmlz697r20000wagscgomewla	POS-MMQPUS07	2026-03-14 19:26:08.455	\N	cmme68zvm0000lp9k3lfop3js	1059.32	190.68	1250.00	SENT	2026-03-14 19:26:08.592	2026-03-14 19:26:09.757	cmmqpuste0014dd9ktgbf5kaw	\N
cmmqpxzn70019dd9kcx94fvts	cmlz697r20000wagscgomewla	POS-MMQPXZI3	2026-03-14 19:28:38.139	\N	cmme68zvm0000lp9k3lfop3js	288.14	51.86	340.00	PAID	2026-03-14 19:28:38.323	2026-03-14 19:28:39.613	cmmqpy0g8001cdd9kuiyn7f7a	\N
cmmqscd31000009l4mjqdp01y	cmlz697r20000wagscgomewla	POS-MMQSCCTW	2026-03-14 20:35:47.828	\N	cmme68zvm0000lp9k3lfop3js	1059.32	190.68	1250.00	SENT	2026-03-14 20:35:48.157	2026-03-14 20:35:48.518	cmmqscdas000309l4j976b3af	\N
cmms5q2nc0000jpgrb7yf72nd	cmlz697r20000wagscgomewla	POS-MMS5Q2A3	2026-03-15 19:38:08.523	\N	cmme68zvm0000lp9k3lfop3js	29.66	5.34	35.00	SENT	2026-03-15 19:38:08.999	2026-03-15 19:38:10.403	cmms5q3je0003jpgrcs2wwulg	\N
cmms6aiha0007jpgrw99drbcq	cmlz697r20000wagscgomewla	FE-1104	2026-03-15 00:00:00	\N	cmme68zvm0000lp9k3lfop3js	35.00	6.30	41.30	PAID	2026-03-15 19:54:02.225	2026-03-15 19:54:03.53	cmms6aizj0009jpgr7mq67g0d	\N
cmms6cwc7000ejpgr7kghcnla	cmlz697r20000wagscgomewla	POS-MMS6CW7T	2026-03-15 19:55:53.753	\N	cmme68zvm0000lp9k3lfop3js	29.66	5.34	35.00	SENT	2026-03-15 19:55:53.911	2026-03-15 19:55:55.639	cmms6cxhw000hjpgrf1je7so8	\N
cmms6rfep000njpgrr2hfes0q	cmlz697r20000wagscgomewla	POS-MMS6RDXT	2026-03-15 20:07:09.905	\N	cmme68zvm0000lp9k3lfop3js	29.66	5.34	35.00	SENT	2026-03-15 20:07:11.809	2026-03-15 20:07:14.725	cmms6rguk000qjpgr5lf9psc2	\N
cmms6zy4i000ujpgrnkmp9i51	cmlz697r20000wagscgomewla	POS-MMS6ZXOP	2026-03-15 20:13:48.745	\N	cmme68zvm0000lp9k3lfop3js	29.66	5.34	35.00	SENT	2026-03-15 20:13:49.314	2026-03-15 20:13:53.361	cmms7009m000xjpgrqomywb0o	\N
\.


--
-- Data for Name: InvoiceItem; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."InvoiceItem" (id, "invoiceId", "productId", quantity, price, total, description, tax) FROM stdin;
cmlz699ne000awagscesymhlu	cmlz699lu0009wags9kfe0i6q	cmlz699dt0008wagsjxhvy7tc	1	1250.00	1250.00	\N	0.00
cmlz6ep1k000109l8qlsrc2ew	cmlz6ep13000009l8bcvhwbex	cmlz6996h0007wagsa4rqslxf	1	340.00	340.00	\N	0.00
cmlz6frls000309l8smysuvf9	cmlz6frlb000209l89kry8u76	cmlz6996h0007wagsa4rqslxf	1	340.00	340.00	\N	0.00
cmme49no400029c9k9cjw5f9l	cmme3xe6y0000kd9kghi6mf62	cmlz699dt0008wagsjxhvy7tc	1	1250.00	1487.50	Laptop Dell XPS 13	0.00
cmme49nr200039c9koac1q4gc	cmme3xe6y0000kd9kghi6mf62	cmlz6996h0007wagsa4rqslxf	1	340.00	404.60	Servicios Cloud AWS	0.00
cmme4h61q00059c9kc28v2ek5	cmme4h5yt00049c9knbivtpb8	cmlz6996h0007wagsa4rqslxf	4	340.00	1360.00	Servicios Cloud AWS	0.00
cmme4j4hc00079c9kqihwcgkp	cmme4j4e300069c9k4i17i8fp	cmlz6996h0007wagsa4rqslxf	4	340.00	1360.00	Servicios Cloud AWS	0.00
cmme4xcih00042h9ki7sxl4ij	cmme4xcgb00032h9kjdjpxeds	cmlz699dt0008wagsjxhvy7tc	1	1250.00	1250.00	Laptop Dell XPS 13	0.00
cmme5aiqu00062h9kptrl1vmb	cmme5aiox00052h9kcj5usafq	cmlz699dt0008wagsjxhvy7tc	3	1250.00	4462.50	Laptop Dell XPS 13	0.00
cmmedzxkg000109l2f99f1ubb	cmmedzxi8000009l2lul0i1sy	cmlz699dt0008wagsjxhvy7tc	1	1250.00	1250.00	Laptop Dell XPS 13	0.00
cmmedzxkg000209l27cld0ec6	cmmedzxi8000009l2lul0i1sy	cmlz6996h0007wagsa4rqslxf	1	340.00	340.00	Servicios Cloud AWS	0.00
cmmfk7065000a6wguistcbuzq	cmmfk703100096wgu8wxs31us	cmlz699dt0008wagsjxhvy7tc	13	1250.00	16250.00	Laptop Dell XPS 13	0.00
cmmmpm3zo0001py9k4wbm2zoi	cmmmpm3xd0000py9k4rlxcixx	cmlz699dt0008wagsjxhvy7tc	1	1250.00	1250.00	Laptop Dell XPS 13	0.00
cmmms0elb0001qt9k2tfjf609	cmmms0eji0000qt9kvby4w05d	cmlz699dt0008wagsjxhvy7tc	3	1250.00	3750.00	Laptop Dell XPS 13	0.00
cmmms9cfz0003qt9kr5jb1n6o	cmmms9ceg0002qt9kfrmw16tu	cmlz699dt0008wagsjxhvy7tc	8	1250.00	10000.00	Laptop Dell XPS 13	0.00
cmmmsk1bt0009qt9kwnaey7ot	cmmmsk1aa0008qt9kwvra8p6m	cmlz6996h0007wagsa4rqslxf	1	340.00	340.00	Servicios Cloud AWS	0.00
cmmmvo1ci0001ui9kpawi6rww	cmmmvo1950000ui9kra1bl7k1	cmlz699dt0008wagsjxhvy7tc	1	1250.00	1487.50	Laptop Dell XPS 13	237.50
cmmmvp6vu0007ui9kv8proqfy	cmmmvp6si0006ui9kclovtf8y	cmlz699dt0008wagsjxhvy7tc	1	1250.00	1487.50	Laptop Dell XPS 13	237.50
cmmpb2qej0001x59k6fun36fq	cmmpb2qch0000x59kmsj3m8cn	cmmfjgbiq0003xxgu2nzut5mr	1	50.00	50.00	Teclado Mec	0.00
cmmpb2rbw0008x59kjnrbu3a6	cmmpb2r9y0007x59ki7p2ewrj	cmmfjgbiq0003xxgu2nzut5mr	1	50.00	50.00	Teclado Mec	0.00
cmmpbf8bw000fx59kstbxfy4p	cmmpbf8af000ex59kie34np6y	cmlz6996h0007wagsa4rqslxf	1	340.00	340.00	Servicios Cloud AWS	0.00
cmmpbm8kq000mx59kxnxcl47q	cmmpbm8in000lx59ks5naii0m	cmmfjgbiq0003xxgu2nzut5mr	1	50.00	50.00	Teclado Mec	0.00
cmmpbnsc0000tx59kqv82vxuh	cmmpbnsai000sx59khjjq8a46	cmlz6996h0007wagsa4rqslxf	1	340.00	340.00	Servicios Cloud AWS	0.00
cmmpbscpg0010x59kqqzslv8k	cmmpbscnv000zx59k5gst47ct	cmmfjgbiq0003xxgu2nzut5mr	1	50.00	50.00	Teclado Mec	0.00
cmmpbu1qf0017x59klpl6pi53	cmmpbu1ox0016x59kzm0i55en	cmmfjgbiq0003xxgu2nzut5mr	1	50.00	50.00	Teclado Mec	0.00
cmmpbzyzu001ex59kxf5sxs6x	cmmpbzyx8001dx59kvljzl87p	cmmfjgbiq0003xxgu2nzut5mr	1	50.00	50.00	Teclado Mec	0.00
cmmpc74fr001lx59kisw2e5ya	cmmpc74ea001kx59kgr2i6tib	cmlz6996h0007wagsa4rqslxf	1	340.00	340.00	Servicios Cloud AWS	0.00
cmmpci6dj001sx59k09vpqgbu	cmmpci6c1001rx59kh0qpev5b	cmmfjgbiq0003xxgu2nzut5mr	1	50.00	50.00	Teclado Mec	0.00
cmmpcnscl001zx59kn5xk8xe1	cmmpcnsb2001yx59kbqjptjlu	cmlz6996h0007wagsa4rqslxf	1	340.00	340.00	Servicios Cloud AWS	0.00
cmmpcwyjb0026x59kt65878o4	cmmpcwygm0025x59kyd2u65zk	cmlz6996h0007wagsa4rqslxf	1	340.00	340.00	Servicios Cloud AWS	0.00
cmmpcyo85002dx59kgjaxxbuk	cmmpcyo6p002cx59k1teqkae0	cmlz699dt0008wagsjxhvy7tc	1	1250.00	1250.00	Laptop Dell XPS 13	0.00
cmmpcyo85002ex59krho39l86	cmmpcyo6p002cx59k1teqkae0	cmlz6996h0007wagsa4rqslxf	2	340.00	680.00	Servicios Cloud AWS	0.00
cmmpjguic0001dw9k0xpmppiz	cmmpjguge0000dw9k09po4odp	cmlz6996h0007wagsa4rqslxf	1	340.00	340.00	Servicios Cloud AWS	0.00
cmmpjguic0002dw9ktxc4btss	cmmpjguge0000dw9k09po4odp	cmlz699dt0008wagsjxhvy7tc	1	1250.00	1250.00	Laptop Dell XPS 13	0.00
cmmpkd9p5000adw9kon84foi1	cmmpkd9mw0009dw9kst9n4360	cmmfjgbiq0003xxgu2nzut5mr	1	50.00	50.00	Teclado Mec	0.00
cmmpkvgan000hdw9k79kudbbi	cmmpkvg95000gdw9kd2f5lwj9	cmmfjgbiq0003xxgu2nzut5mr	1	50.00	50.00	Teclado Mec	0.00
cmmplahwf0002639kwoff1u6q	cmmplahun0001639kncsv1f2s	cmlz6996h0007wagsa4rqslxf	1	340.00	340.00	Servicios Cloud AWS	0.00
cmmplgk4o00013r9kmy46vljy	cmmplgk3400003r9k15hhi4hk	cmmfjgbiq0003xxgu2nzut5mr	1	50.00	50.00	Teclado Mec	0.00
cmmpli6cz00093r9krb8d2e98	cmmpli6bf00083r9kxbopmg56	cmlz6996h0007wagsa4rqslxf	2	340.00	680.00	Servicios Cloud AWS	0.00
cmmpliluy000g3r9khndafoj1	cmmplilth000f3r9ky1ups37n	cmlz6996h0007wagsa4rqslxf	1	340.00	340.00	Servicios Cloud AWS	0.00
cmmplnsh60002vl9kjmlwprvb	cmmplnsfq0001vl9kwsjwzdw1	cmlz6996h0007wagsa4rqslxf	1	340.00	340.00	Servicios Cloud AWS	0.00
cmmpluxvj0001uo9klr3ap8y5	cmmpluxtq0000uo9khr5oug1o	cmlz6996h0007wagsa4rqslxf	1	340.00	340.00	Servicios Cloud AWS	0.00
cmmpm3xwf0001kf9kazcbhfy7	cmmpm3xuw0000kf9ktv52lh75	cmlz699dt0008wagsjxhvy7tc	1	1250.00	1250.00	Laptop Dell XPS 13	0.00
cmmpm3xwf0002kf9kftrahche	cmmpm3xuw0000kf9ktv52lh75	cmlz6996h0007wagsa4rqslxf	1	340.00	340.00	Servicios Cloud AWS	0.00
cmmqoemsn00024k9kxzqup94v	cmmqoemqd00014k9kzeb2u9eh	cmlz6996h0007wagsa4rqslxf	1	340.00	340.00	Servicios Cloud AWS	0.00
cmmqorgtb00094k9k83oesjuj	cmmqorgqh00084k9kso4q03lj	cmlz699dt0008wagsjxhvy7tc	1	1250.00	1250.00	Laptop Dell XPS 13	0.00
cmmqos1id000g4k9kjehkkg4v	cmmqos1gu000f4k9kt3i0as9g	cmlz699dt0008wagsjxhvy7tc	2	1250.00	2500.00	Laptop Dell XPS 13	0.00
cmmqpafef0001dd9kjl3b7cpp	cmmqpafcy0000dd9kmfm1w6md	cmlz699dt0008wagsjxhvy7tc	1	1250.00	1250.00	Laptop Dell XPS 13	0.00
cmmqpan900008dd9krhv1pu7z	cmmqpan790007dd9kuit8vqu9	cmlz699dt0008wagsjxhvy7tc	3	1250.00	3750.00	Laptop Dell XPS 13	0.00
cmmqpbnfp000fdd9kpy5vo6fv	cmmqpbne9000edd9k9uf9noy1	cmlz699dt0008wagsjxhvy7tc	3	1250.00	3750.00	Laptop Dell XPS 13	0.00
cmmqpbnfp000gdd9kxcgn2wgi	cmmqpbne9000edd9k9uf9noy1	cmlz6996h0007wagsa4rqslxf	1	340.00	340.00	Servicios Cloud AWS	0.00
cmmqphd4a000odd9k35wyt05e	cmmqphd2t000ndd9khq1ck86s	cmlz699dt0008wagsjxhvy7tc	1	1250.00	1250.00	Laptop Dell XPS 13	0.00
cmmqpqix5000vdd9krjlbvljz	cmmqpqiv3000udd9ktre20xxo	cmlz699dt0008wagsjxhvy7tc	1	1250.00	1250.00	Laptop Dell XPS 13	0.00
cmmqpus5i0012dd9k16d4reni	cmmqpus410011dd9k4wri6z4j	cmlz699dt0008wagsjxhvy7tc	1	1250.00	1250.00	Laptop Dell XPS 13	0.00
cmmqpxzp3001add9kjikmqgf8	cmmqpxzn70019dd9kcx94fvts	cmlz6996h0007wagsa4rqslxf	1	340.00	340.00	Servicios Cloud AWS	0.00
cmmqscd3h000109l4pngpsoxr	cmmqscd31000009l4mjqdp01y	cmlz699dt0008wagsjxhvy7tc	1	1250.00	1250.00	Laptop Dell XPS 13	0.00
cmms5q2q00001jpgr01uia32e	cmms5q2nc0000jpgrb7yf72nd	prod-cmlz697r20000wagscgomewla-bisagra	1	35.00	35.00	Bisagra de Acero	0.00
cmms6aiko0008jpgr2mzrempv	cmms6aiha0007jpgrw99drbcq	prod-cmlz697r20000wagscgomewla-bisagra	1	35.00	41.30	Bisagra de Acero	6.30
cmms6cwdr000fjpgrtcfwb96i	cmms6cwc7000ejpgr7kghcnla	prod-cmlz697r20000wagscgomewla-bisagra	1	35.00	35.00	Bisagra de Acero	0.00
cmms6rfh9000ojpgrrwz8y2tw	cmms6rfep000njpgrr2hfes0q	prod-cmlz697r20000wagscgomewla-bisagra	1	35.00	35.00	Bisagra de Acero	0.00
cmms6zyaa000vjpgrjon2vmzy	cmms6zy4i000ujpgrnkmp9i51	prod-cmlz697r20000wagscgomewla-bisagra	1	35.00	35.00	Bisagra de Acero	0.00
\.


--
-- Data for Name: JournalEntry; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."JournalEntry" (id, "organizationId", date, description, "sourceType", "sourceId", reference, status, "createdAt", "updatedAt") FROM stdin;
cmmmnpqwz00009r9k85ur2ssx	cmlz697r20000wagscgomewla	2026-03-11 00:00:00	Oportunidad para cliente nuevo	\N	\N		POSTED	2026-03-11 23:15:09.42	2026-03-11 23:15:09.42
cmmms9czx0004qt9k7pj1l26s	cmlz697r20000wagscgomewla	2026-03-12 01:22:19.628	Factura #POS-0JMWSX - Cliente VIP	INVOICE	cmmms9ceg0002qt9kfrmw16tu	POS-0JMWSX	POSTED	2026-03-12 01:22:23.321	2026-03-12 01:22:23.321
cmmmsk1ts000aqt9kubvcvgtn	cmlz697r20000wagscgomewla	2026-03-12 01:30:40.606	Factura #POS-2QLH5Y - Cliente VIP	INVOICE	cmmmsk1aa0008qt9kwvra8p6m	POS-2QLH5Y	POSTED	2026-03-12 01:30:42.062	2026-03-12 01:30:42.062
cmmmt5n8t000kqt9k7h2n4ro1	cmlz697r20000wagscgomewla	2026-03-12 00:00:00	Compra #COMP-75928 - Truper	EXPENSE	cmmmt5mlh000iqt9kcvjqbo75	COMP-75928	POSTED	2026-03-12 01:47:29.591	2026-03-12 01:47:29.591
cmmmtbieq000qqt9k7vrpayq1	cmlz697r20000wagscgomewla	2026-03-12 00:00:00	Compra #COMP-37293 - Truper	EXPENSE	cmmmtbhos000oqt9koqwh8wj4	COMP-37293	POSTED	2026-03-12 01:52:03.26	2026-03-12 01:52:03.26
cmmmu0ndu000xqt9kraivwqql	cmlz697r20000wagscgomewla	2026-03-12 00:00:00	Pago de Compra #COMP-76179 - Damian Vasquez	PAYMENT	cmmmu0khn000wqt9kudaak784	10000-0254	POSTED	2026-03-12 02:11:35.815	2026-03-12 02:11:35.815
cmmmvo1r80002ui9krksry46n	cmlz697r20000wagscgomewla	2026-03-12 00:00:00	Factura #FE-6223 - Damian Vasquez	INVOICE	cmmmvo1950000ui9kra1bl7k1	FE-6223	POSTED	2026-03-12 02:57:47.437	2026-03-12 02:57:47.437
cmmmvp79t0008ui9k4mz2gy3m	cmlz697r20000wagscgomewla	2026-03-12 00:00:00	Factura #FE-8628 - Tech Solutions S.A.S	INVOICE	cmmmvp6si0006ui9kclovtf8y	FE-8628	POSTED	2026-03-12 02:58:41.244	2026-03-12 02:58:41.244
cmmmvq8n0000dui9k7olyzp0a	cmlz697r20000wagscgomewla	2026-03-12 00:00:00	Pago de Factura #FE-8628 - Tech Solutions S.A.S	PAYMENT	cmmmvq81g000cui9kgjg2ebtk	FE-8628	POSTED	2026-03-12 02:59:29.632	2026-03-12 02:59:29.632
cmmpb2qzy0003x59kb8yskmx4	cmlz697r20000wagscgomewla	2026-03-13 19:44:37.151	Venta POS #POS-MMPB2OTB	POS	cmmpb2qch0000x59kmsj3m8cn	POS-MMPB2OTB	POSTED	2026-03-13 19:44:39.928	2026-03-13 19:44:39.928
cmmpb2rx9000ax59k7jsl4u08	cmlz697r20000wagscgomewla	2026-03-13 19:44:39.878	Venta POS #POS-MMPB2QX2	POS	cmmpb2r9y0007x59ki7p2ewrj	POS-MMPB2QX2	POSTED	2026-03-13 19:44:41.129	2026-03-13 19:44:41.129
cmmpbf8w5000hx59kx529o01p	cmlz697r20000wagscgomewla	2026-03-13 19:54:21.607	Venta POS #POS-MMPBF7S7	POS	cmmpbf8af000ex59kie34np6y	POS-MMPBF7S7	POSTED	2026-03-13 19:54:22.987	2026-03-13 19:54:22.987
cmmpbm97q000ox59km189ugcw	cmlz697r20000wagscgomewla	2026-03-13 19:59:47.592	Venta POS #POS-MMPBM7BC	POS	cmmpbm8in000lx59ks5naii0m	POS-MMPBM7BC	POSTED	2026-03-13 19:59:50.002	2026-03-13 19:59:50.002
cmmpbnswb000vx59kihxs0fzm	cmlz697r20000wagscgomewla	2026-03-13 20:01:00.867	Venta POS #POS-MMPBNRUR	POS	cmmpbnsai000sx59khjjq8a46	POS-MMPBNRUR	POSTED	2026-03-13 20:01:02.167	2026-03-13 20:01:02.167
cmmpbsdcn0012x59k9hkjlwst	cmlz697r20000wagscgomewla	2026-03-13 20:04:33.74	Venta POS #POS-MMPBSC3W	POS	cmmpbscnv000zx59k5gst47ct	POS-MMPBSC3W	POSTED	2026-03-13 20:04:35.292	2026-03-13 20:04:35.292
cmmpbu2bf0019x59kqsjop5m6	cmlz697r20000wagscgomewla	2026-03-13 20:05:52.814	Venta POS #POS-MMPBU14E	POS	cmmpbu1ox0016x59kzm0i55en	POS-MMPBU14E	POSTED	2026-03-13 20:05:54.31	2026-03-13 20:05:54.31
cmmpbzzk6001gx59kiwbt7x68	cmlz697r20000wagscgomewla	2026-03-13 20:10:29.428	Venta POS #POS-MMPBZYK4	POS	cmmpbzyx8001dx59kvljzl87p	POS-MMPBZYK4	POSTED	2026-03-13 20:10:30.673	2026-03-13 20:10:30.673
cmmpc751g001nx59kgzazt7l0	cmlz697r20000wagscgomewla	2026-03-13 20:16:02.797	Venta POS #POS-MMPC73SD	POS	cmmpc74ea001kx59kgr2i6tib	POS-MMPC73SD	POSTED	2026-03-13 20:16:04.367	2026-03-13 20:16:04.367
cmmpci6yc001ux59k319lrywj	cmlz697r20000wagscgomewla	2026-03-13 20:24:38.762	Venta POS #POS-MMPCI5WQ	POS	cmmpci6c1001rx59kh0qpev5b	POS-MMPCI5WQ	POSTED	2026-03-13 20:24:40.059	2026-03-13 20:24:40.059
cmmpcnswc0021x59klfq5991x	cmlz697r20000wagscgomewla	2026-03-13 20:29:00.594	Venta POS #POS-MMPCNRXU	POS	cmmpcnsb2001yx59kbqjptjlu	POS-MMPCNRXU	POSTED	2026-03-13 20:29:01.785	2026-03-13 20:29:01.785
cmmpcwz4y0028x59kpge2zfjj	cmlz697r20000wagscgomewla	2026-03-13 20:36:08.386	Venta POS #POS-MMPCWY0Y	POS	cmmpcwygm0025x59kyd2u65zk	POS-MMPCWY0Y	POSTED	2026-03-13 20:36:09.753	2026-03-13 20:36:09.753
cmmpcyowc002hx59kt4j03yfv	cmlz697r20000wagscgomewla	2026-03-13 20:37:28.26	Venta POS #POS-MMPCYNNO	POS	cmmpcyo6p002cx59k1teqkae0	POS-MMPCYNNO	POSTED	2026-03-13 20:37:29.816	2026-03-13 20:37:29.816
cmmpjgver0005dw9kz2dqt7ox	cmlz697r20000wagscgomewla	2026-03-13 23:39:33.989	Venta POS #POS-MMPJGU05	POS	cmmpjguge0000dw9k09po4odp	POS-MMPJGU05	POSTED	2026-03-13 23:39:35.757	2026-03-13 23:39:35.757
cmmpkdadn000cdw9kmg9yrthj	cmlz697r20000wagscgomewla	2026-03-14 00:04:45.698	Venta POS #POS-MMPKD8G2	POS	cmmpkd9mw0009dw9kst9n4360	POS-MMPKD8G2	POSTED	2026-03-14 00:04:48.15	2026-03-14 00:04:48.15
cmmpkvgw0000jdw9kk3178aj0	cmlz697r20000wagscgomewla	2026-03-14 00:18:54.447	Venta POS #POS-MMPKVFCF	POS	cmmpkvg95000gdw9kd2f5lwj9	POS-MMPKVFCF	POSTED	2026-03-14 00:18:56.394	2026-03-14 00:18:56.394
cmmplailc0004639kv6z7ydbe	cmlz697r20000wagscgomewla	2026-03-14 00:30:36.877	Venta POS #POS-MMPLAHCD	POS	cmmplahun0001639kncsv1f2s	POS-MMPLAHCD	POSTED	2026-03-14 00:30:38.441	2026-03-14 00:30:38.441
cmmplgl3p00033r9kpp2bgw2r	cmlz697r20000wagscgomewla	2026-03-14 00:35:19.668	Venta POS #POS-MMPLGJJO	POS	cmmplgk3400003r9k15hhi4hk	POS-MMPLGJJO	POSTED	2026-03-14 00:35:21.518	2026-03-14 00:35:21.518
cmmpli6xu000b3r9kl8iqg79s	cmlz697r20000wagscgomewla	2026-03-14 00:36:35.314	Venta POS #POS-MMPLI5WY	POS	cmmpli6bf00083r9kxbopmg56	POS-MMPLI5WY	POSTED	2026-03-14 00:36:36.589	2026-03-14 00:36:36.589
cmmplimfu000i3r9kf8afrcaz	cmlz697r20000wagscgomewla	2026-03-14 00:36:55.395	Venta POS #POS-MMPLILER	POS	cmmplilth000f3r9ky1ups37n	POS-MMPLILER	POSTED	2026-03-14 00:36:56.676	2026-03-14 00:36:56.676
cmmplnt5h0004vl9kheugzsn2	cmlz697r20000wagscgomewla	2026-03-14 00:40:56.724	Venta POS #POS-MMPLNRMC	POS	cmmplnsfq0001vl9kwsjwzdw1	POS-MMPLNRMC	POSTED	2026-03-14 00:40:58.657	2026-03-14 00:40:58.657
cmmpluz3t0003uo9kncc3fut3	cmlz697r20000wagscgomewla	2026-03-14 00:46:30.109	Venta POS #POS-MMPLUWV1	POS	cmmpluxtq0000uo9khr5oug1o	POS-MMPLUWV1	POSTED	2026-03-14 00:46:32.857	2026-03-14 00:46:32.857
cmmpm3yr80005kf9k17vzulgu	cmlz697r20000wagscgomewla	2026-03-14 00:53:30.673	Venta POS #POS-MMPM3XDD	POS	cmmpm3xuw0000kf9ktv52lh75	POS-MMPM3XDD	POSTED	2026-03-14 00:53:32.416	2026-03-14 00:53:32.416
cmmqoeng400044k9km73oekx8	cmlz697r20000wagscgomewla	2026-03-14 18:45:34.736	Venta POS #POS-MMQOEM4W	POS	cmmqoemqd00014k9kzeb2u9eh	POS-MMQOEM4W	POSTED	2026-03-14 18:45:36.384	2026-03-14 18:45:36.384
cmmqorhxn000b4k9k109fwq7v	cmlz697r20000wagscgomewla	2026-03-14 18:55:34.038	Venta POS #POS-MMQORGK6	POS	cmmqorgqh00084k9kso4q03lj	POS-MMQORGK6	POSTED	2026-03-14 18:55:35.766	2026-03-14 18:55:35.766
cmmqos2ii000i4k9klgm4j87a	cmlz697r20000wagscgomewla	2026-03-14 18:56:00.919	Venta POS #POS-MMQOS1AV	POS	cmmqos1gu000f4k9kt3i0as9g	POS-MMQOS1AV	POSTED	2026-03-14 18:56:02.342	2026-03-14 18:56:02.342
cmmqpag3h0003dd9knibmkkel	cmlz697r20000wagscgomewla	2026-03-14 19:10:18.657	Venta POS #POS-MMQPAF4X	POS	cmmqpafcy0000dd9kmfm1w6md	POS-MMQPAF4X	POSTED	2026-03-14 19:10:19.774	2026-03-14 19:10:19.774
cmmqpanxh000add9kjs6afsx3	cmlz697r20000wagscgomewla	2026-03-14 19:10:28.968	Venta POS #POS-MMQPAN3C	POS	cmmqpan790007dd9kuit8vqu9	POS-MMQPAN3C	POSTED	2026-03-14 19:10:29.973	2026-03-14 19:10:29.973
cmmqpbo8g000jdd9kmalp4p63	cmlz697r20000wagscgomewla	2026-03-14 19:11:15.84	Venta POS #POS-MMQPBN9C	POS	cmmqpbne9000edd9k9uf9noy1	POS-MMQPBN9C	POSTED	2026-03-14 19:11:17.053	2026-03-14 19:11:17.053
cmmqphdqu000qdd9kbidirpoe	cmlz697r20000wagscgomewla	2026-03-14 19:15:42.441	Venta POS #POS-MMQPHCYX	POS	cmmqphd2t000ndd9khq1ck86s	POS-MMQPHCYX	POSTED	2026-03-14 19:15:43.393	2026-03-14 19:15:43.393
cmmqpqjqf000xdd9kec5klfu8	cmlz697r20000wagscgomewla	2026-03-14 19:22:49.837	Venta POS #POS-MMQPQIR1	POS	cmmqpqiv3000udd9ktre20xxo	POS-MMQPQIR1	POSTED	2026-03-14 19:22:51.019	2026-03-14 19:22:51.019
cmmqpuste0014dd9ktgbf5kaw	cmlz697r20000wagscgomewla	2026-03-14 19:26:08.455	Venta POS #POS-MMQPUS07	POS	cmmqpus410011dd9k4wri6z4j	POS-MMQPUS07	POSTED	2026-03-14 19:26:09.455	2026-03-14 19:26:09.455
cmmqpy0g8001cdd9kuiyn7f7a	cmlz697r20000wagscgomewla	2026-03-14 19:28:38.139	Venta POS #POS-MMQPXZI3	POS	cmmqpxzn70019dd9kcx94fvts	POS-MMQPXZI3	POSTED	2026-03-14 19:28:39.317	2026-03-14 19:28:39.317
cmmqscdas000309l4j976b3af	cmlz697r20000wagscgomewla	2026-03-14 20:35:47.828	Venta POS #POS-MMQSCCTW	POS	cmmqscd31000009l4mjqdp01y	POS-MMQSCCTW	POSTED	2026-03-14 20:35:48.419	2026-03-14 20:35:48.419
cmms5q3je0003jpgrcs2wwulg	cmlz697r20000wagscgomewla	2026-03-15 19:38:08.523	Venta POS #POS-MMS5Q2A3	POS	cmms5q2nc0000jpgrb7yf72nd	POS-MMS5Q2A3	POSTED	2026-03-15 19:38:10.1	2026-03-15 19:38:10.1
cmms6aizj0009jpgr7mq67g0d	cmlz697r20000wagscgomewla	2026-03-15 00:00:00	Factura #FE-1104 - Damian Vasquez	INVOICE	cmms6aiha0007jpgrw99drbcq	FE-1104	POSTED	2026-03-15 19:54:03.24	2026-03-15 19:54:03.24
cmms6cxhw000hjpgrf1je7so8	cmlz697r20000wagscgomewla	2026-03-15 19:55:53.753	Venta POS #POS-MMS6CW7T	POS	cmms6cwc7000ejpgr7kghcnla	POS-MMS6CW7T	POSTED	2026-03-15 19:55:55.36	2026-03-15 19:55:55.36
cmms6rguk000qjpgr5lf9psc2	cmlz697r20000wagscgomewla	2026-03-15 20:07:09.905	Venta POS #POS-MMS6RDXT	POS	cmms6rfep000njpgrr2hfes0q	POS-MMS6RDXT	POSTED	2026-03-15 20:07:13.626	2026-03-15 20:07:13.626
cmms7009m000xjpgrqomywb0o	cmlz697r20000wagscgomewla	2026-03-15 20:13:48.745	Venta POS #POS-MMS6ZXOP	POS	cmms6zy4i000ujpgrnkmp9i51	POS-MMS6ZXOP	POSTED	2026-03-15 20:13:51.968	2026-03-15 20:13:51.968
\.


--
-- Data for Name: JournalLine; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."JournalLine" (id, "entryId", "accountId", debit, credit, description, "createdAt") FROM stdin;
cmmmnpqz800019r9k3s3cg8cy	cmmmnpqwz00009r9k85ur2ssx	cmmmn3gkw0002rg9kofjcbtcp	500.00	0.00		2026-03-11 23:15:09.42
cmmmnpqz800029r9kvytlghw6	cmmmnpqwz00009r9k85ur2ssx	cmmmn3gmk0003rg9kwp38vd0j	0.00	500.00		2026-03-11 23:15:09.42
cmmms9d3b0005qt9k6gcbjcel	cmmms9czx0004qt9k7pj1l26s	cmmmrtnq50009x59k5so5b69a	10000.00	0.00	Cliente: Cliente VIP	2026-03-12 01:22:23.321
cmmms9d3b0006qt9k2mm8e8qt	cmmms9czx0004qt9k7pj1l26s	cmmmrtpj10017x59kffk6ot4y	0.00	8474.58	Venta - Factura #POS-0JMWSX	2026-03-12 01:22:23.321
cmmms9d3b0007qt9kx2jqe17g	cmmms9czx0004qt9k7pj1l26s	cmmmrtor3000vx59k7g6k4vnc	0.00	1525.42	ITBIS 18% - Factura #POS-0JMWSX	2026-03-12 01:22:23.321
cmmmsk1v9000bqt9kl9ti3ujp	cmmmsk1ts000aqt9kubvcvgtn	cmmmrtnq50009x59k5so5b69a	340.00	0.00	Cliente: Cliente VIP	2026-03-12 01:30:42.062
cmmmsk1v9000cqt9k4hncxr0s	cmmmsk1ts000aqt9kubvcvgtn	cmmmrtpj10017x59kffk6ot4y	0.00	288.14	Venta - Factura #POS-2QLH5Y	2026-03-12 01:30:42.062
cmmmsk1v9000dqt9k7n0sfucg	cmmmsk1ts000aqt9kubvcvgtn	cmmmrtor3000vx59k7g6k4vnc	0.00	51.86	ITBIS 18% - Factura #POS-2QLH5Y	2026-03-12 01:30:42.062
cmmmt5nbd000lqt9khkksi8lg	cmmmt5n8t000kqt9k7h2n4ro1	cmmmrtqjc001rx59kgkvxvf84	1059.32	0.00	Proveedor: Truper	2026-03-12 01:47:29.591
cmmmt5nbd000mqt9koavuixtv	cmmmt5n8t000kqt9k7h2n4ro1	cmmmrto1g000gx59k817u52u4	190.68	0.00	ITBIS Compras 18% - Compra #COMP-75928	2026-03-12 01:47:29.591
cmmmt5nbd000nqt9kv5l78nv4	cmmmt5n8t000kqt9k7h2n4ro1	cmmmrtomf000sx59kfam4em1i	0.00	1250.00	Compra - Factura #COMP-75928	2026-03-12 01:47:29.591
cmmmtbiga000rqt9ki4x0v4x3	cmmmtbieq000qqt9k7vrpayq1	cmmmrtqjc001rx59kgkvxvf84	2881.36	0.00	Proveedor: Truper	2026-03-12 01:52:03.26
cmmmtbiga000sqt9kmpdhcjqz	cmmmtbieq000qqt9k7vrpayq1	cmmmrto1g000gx59k817u52u4	518.64	0.00	ITBIS Compras 18% - Compra #COMP-37293	2026-03-12 01:52:03.26
cmmmtbiga000tqt9k70krgho2	cmmmtbieq000qqt9k7vrpayq1	cmmmrtomf000sx59kfam4em1i	0.00	3400.00	Compra - Factura #COMP-37293	2026-03-12 01:52:03.26
cmmmu0nfm000yqt9kf19p9fnn	cmmmu0ndu000xqt9kraivwqql	cmmmrtomf000sx59kfam4em1i	25000.00	0.00	Pago compra #COMP-76179	2026-03-12 02:11:35.815
cmmmu0nfp000zqt9k8dod6d7x	cmmmu0ndu000xqt9kraivwqql	cmmmrtnix0005x59kwj0bl3tv	0.00	25000.00	Pago realizado - BANK_TRANSFER	2026-03-12 02:11:35.815
cmmmvo1sv0003ui9ku8rusmzk	cmmmvo1r80002ui9krksry46n	cmmmrtnq50009x59k5so5b69a	1487.50	0.00	Cliente: Damian Vasquez	2026-03-12 02:57:47.437
cmmmvo1sv0004ui9krx7tw419	cmmmvo1r80002ui9krksry46n	cmmmrtpj10017x59kffk6ot4y	0.00	1250.00	Venta - Factura #FE-6223	2026-03-12 02:57:47.437
cmmmvo1sv0005ui9k0rpadywy	cmmmvo1r80002ui9krksry46n	cmmmrtor3000vx59k7g6k4vnc	0.00	237.50	ITBIS 18% - Factura #FE-6223	2026-03-12 02:57:47.437
cmmmvp7bd0009ui9kyolmohdt	cmmmvp79t0008ui9k4mz2gy3m	cmmmrtnq50009x59k5so5b69a	1487.50	0.00	Cliente: Tech Solutions S.A.S	2026-03-12 02:58:41.244
cmmmvp7bd000aui9kgy1nkuv6	cmmmvp79t0008ui9k4mz2gy3m	cmmmrtpj10017x59kffk6ot4y	0.00	1250.00	Venta - Factura #FE-8628	2026-03-12 02:58:41.244
cmmmvp7bd000bui9k3ce5i3jn	cmmmvp79t0008ui9k4mz2gy3m	cmmmrtor3000vx59k7g6k4vnc	0.00	237.50	ITBIS 18% - Factura #FE-8628	2026-03-12 02:58:41.244
cmmmvq8oo000eui9ktu5ll3cj	cmmmvq8n0000dui9k7olyzp0a	cmmmrtnev0003x59k20kh2oqz	487.50	0.00	Pago recibido - CASH	2026-03-12 02:59:29.632
cmmmvq8oo000fui9ke0rxrj6v	cmmmvq8n0000dui9k7olyzp0a	cmmmrtnq50009x59k5so5b69a	0.00	487.50	Pago factura #FE-8628	2026-03-12 02:59:29.632
cmmpb2r1n0004x59kb9464mwg	cmmpb2qzy0003x59kb8yskmx4	cmmmrtncz0002x59kxlcaqcu6	50.00	0.00	Venta POS - Contado	2026-03-13 19:44:39.928
cmmpb2r1o0005x59k1h0z44su	cmmpb2qzy0003x59kb8yskmx4	cmmmrtpj10017x59kffk6ot4y	0.00	42.37	Venta - Factura #POS-MMPB2OTB	2026-03-13 19:44:39.928
cmmpb2r1o0006x59k7f5bvsuh	cmmpb2qzy0003x59kb8yskmx4	cmmmrtor3000vx59k7g6k4vnc	0.00	7.63	ITBIS 18% - Factura #POS-MMPB2OTB	2026-03-13 19:44:39.928
cmmpb2ryp000bx59k48upe2m1	cmmpb2rx9000ax59k7jsl4u08	cmmmrtncz0002x59kxlcaqcu6	50.00	0.00	Venta POS - Contado	2026-03-13 19:44:41.129
cmmpb2ryp000cx59kq8y3cqsa	cmmpb2rx9000ax59k7jsl4u08	cmmmrtpj10017x59kffk6ot4y	0.00	42.37	Venta - Factura #POS-MMPB2QX2	2026-03-13 19:44:41.129
cmmpb2ryp000dx59k7vo1rzsg	cmmpb2rx9000ax59k7jsl4u08	cmmmrtor3000vx59k7g6k4vnc	0.00	7.63	ITBIS 18% - Factura #POS-MMPB2QX2	2026-03-13 19:44:41.129
cmmpbf8xo000ix59keam2xt5x	cmmpbf8w5000hx59kx529o01p	cmmmrtncz0002x59kxlcaqcu6	340.00	0.00	Venta POS - Contado	2026-03-13 19:54:22.987
cmmpbf8xo000jx59kr2tnxodm	cmmpbf8w5000hx59kx529o01p	cmmmrtpj10017x59kffk6ot4y	0.00	288.14	Venta - Factura #POS-MMPBF7S7	2026-03-13 19:54:22.987
cmmpbf8xo000kx59kvbpry7d7	cmmpbf8w5000hx59kx529o01p	cmmmrtor3000vx59k7g6k4vnc	0.00	51.86	ITBIS 18% - Factura #POS-MMPBF7S7	2026-03-13 19:54:22.987
cmmpbm99f000px59kpzv9yknc	cmmpbm97q000ox59km189ugcw	cmmmrtncz0002x59kxlcaqcu6	50.00	0.00	Venta POS - Contado	2026-03-13 19:59:50.002
cmmpbm99f000qx59kpqvhpc6v	cmmpbm97q000ox59km189ugcw	cmmmrtpj10017x59kffk6ot4y	0.00	42.37	Venta - Factura #POS-MMPBM7BC	2026-03-13 19:59:50.002
cmmpbm99f000rx59kqijvarpe	cmmpbm97q000ox59km189ugcw	cmmmrtor3000vx59k7g6k4vnc	0.00	7.63	ITBIS 18% - Factura #POS-MMPBM7BC	2026-03-13 19:59:50.002
cmmpbnsy0000wx59krmjgqimj	cmmpbnswb000vx59kihxs0fzm	cmmmrtncz0002x59kxlcaqcu6	340.00	0.00	Venta POS - Contado	2026-03-13 20:01:02.167
cmmpbnsy0000xx59krsmayt46	cmmpbnswb000vx59kihxs0fzm	cmmmrtpj10017x59kffk6ot4y	0.00	288.14	Venta - Factura #POS-MMPBNRUR	2026-03-13 20:01:02.167
cmmpbnsy0000yx59kg3l57w7e	cmmpbnswb000vx59kihxs0fzm	cmmmrtor3000vx59k7g6k4vnc	0.00	51.86	ITBIS 18% - Factura #POS-MMPBNRUR	2026-03-13 20:01:02.167
cmmpbsde70013x59karei4029	cmmpbsdcn0012x59k9hkjlwst	cmmmrtncz0002x59kxlcaqcu6	50.00	0.00	Venta POS - Contado	2026-03-13 20:04:35.292
cmmpbsde70014x59kfleewbvd	cmmpbsdcn0012x59k9hkjlwst	cmmmrtpj10017x59kffk6ot4y	0.00	42.37	Venta - Factura #POS-MMPBSC3W	2026-03-13 20:04:35.292
cmmpbsde70015x59kb5ha08pi	cmmpbsdcn0012x59k9hkjlwst	cmmmrtor3000vx59k7g6k4vnc	0.00	7.63	ITBIS 18% - Factura #POS-MMPBSC3W	2026-03-13 20:04:35.292
cmmpbu2cy001ax59k1w67so51	cmmpbu2bf0019x59kqsjop5m6	cmmmrtncz0002x59kxlcaqcu6	50.00	0.00	Venta POS - Contado	2026-03-13 20:05:54.31
cmmpbu2cy001bx59kek0nvhh3	cmmpbu2bf0019x59kqsjop5m6	cmmmrtpj10017x59kffk6ot4y	0.00	42.37	Venta - Factura #POS-MMPBU14E	2026-03-13 20:05:54.31
cmmpbu2cy001cx59ktjw44lcm	cmmpbu2bf0019x59kqsjop5m6	cmmmrtor3000vx59k7g6k4vnc	0.00	7.63	ITBIS 18% - Factura #POS-MMPBU14E	2026-03-13 20:05:54.31
cmmpbzzlt001hx59kl22b45da	cmmpbzzk6001gx59kiwbt7x68	cmmmrtncz0002x59kxlcaqcu6	50.00	0.00	Venta POS - Contado	2026-03-13 20:10:30.673
cmmpbzzlt001ix59k2uec97b0	cmmpbzzk6001gx59kiwbt7x68	cmmmrtpj10017x59kffk6ot4y	0.00	42.37	Venta - Factura #POS-MMPBZYK4	2026-03-13 20:10:30.673
cmmpbzzlt001jx59kqgtqtolq	cmmpbzzk6001gx59kiwbt7x68	cmmmrtor3000vx59k7g6k4vnc	0.00	7.63	ITBIS 18% - Factura #POS-MMPBZYK4	2026-03-13 20:10:30.673
cmmpc752z001ox59ko24hzbr3	cmmpc751g001nx59kgzazt7l0	cmmmrtncz0002x59kxlcaqcu6	340.00	0.00	Venta POS - Contado	2026-03-13 20:16:04.367
cmmpc752z001px59k0vwo4iyf	cmmpc751g001nx59kgzazt7l0	cmmmrtpj10017x59kffk6ot4y	0.00	288.14	Venta - Factura #POS-MMPC73SD	2026-03-13 20:16:04.367
cmmpc752z001qx59kp44s14c7	cmmpc751g001nx59kgzazt7l0	cmmmrtor3000vx59k7g6k4vnc	0.00	51.86	ITBIS 18% - Factura #POS-MMPC73SD	2026-03-13 20:16:04.367
cmmpci6zw001vx59k78wssjl1	cmmpci6yc001ux59k319lrywj	cmmmrtncz0002x59kxlcaqcu6	50.00	0.00	Venta POS - Contado	2026-03-13 20:24:40.059
cmmpci6zw001wx59k7qiawj1m	cmmpci6yc001ux59k319lrywj	cmmmrtpj10017x59kffk6ot4y	0.00	42.37	Venta - Factura #POS-MMPCI5WQ	2026-03-13 20:24:40.059
cmmpci6zw001xx59kb5iwdwfj	cmmpci6yc001ux59k319lrywj	cmmmrtor3000vx59k7g6k4vnc	0.00	7.63	ITBIS 18% - Factura #POS-MMPCI5WQ	2026-03-13 20:24:40.059
cmmpcnsxu0022x59kftayzjxd	cmmpcnswc0021x59klfq5991x	cmmmrtncz0002x59kxlcaqcu6	340.00	0.00	Venta POS - Contado	2026-03-13 20:29:01.785
cmmpcnsxu0023x59koi8eq0zu	cmmpcnswc0021x59klfq5991x	cmmmrtpj10017x59kffk6ot4y	0.00	288.14	Venta - Factura #POS-MMPCNRXU	2026-03-13 20:29:01.785
cmmpcnsxv0024x59kvidvperz	cmmpcnswc0021x59klfq5991x	cmmmrtor3000vx59k7g6k4vnc	0.00	51.86	ITBIS 18% - Factura #POS-MMPCNRXU	2026-03-13 20:29:01.785
cmmpcwz7g0029x59k96imh6zx	cmmpcwz4y0028x59kpge2zfjj	cmmmrtncz0002x59kxlcaqcu6	340.00	0.00	Venta POS - Contado	2026-03-13 20:36:09.753
cmmpcwz7g002ax59kg5kh32xo	cmmpcwz4y0028x59kpge2zfjj	cmmmrtpj10017x59kffk6ot4y	0.00	288.14	Venta - Factura #POS-MMPCWY0Y	2026-03-13 20:36:09.753
cmmpcwz7g002bx59k3ow1dnr6	cmmpcwz4y0028x59kpge2zfjj	cmmmrtor3000vx59k7g6k4vnc	0.00	51.86	ITBIS 18% - Factura #POS-MMPCWY0Y	2026-03-13 20:36:09.753
cmmpcyoxs002ix59k0erl1icy	cmmpcyowc002hx59kt4j03yfv	cmmmrtncz0002x59kxlcaqcu6	1930.00	0.00	Venta POS - Contado	2026-03-13 20:37:29.816
cmmpcyoxs002jx59krme2tl5g	cmmpcyowc002hx59kt4j03yfv	cmmmrtpj10017x59kffk6ot4y	0.00	1635.59	Venta - Factura #POS-MMPCYNNO	2026-03-13 20:37:29.816
cmmpcyoxs002kx59kzi8kve70	cmmpcyowc002hx59kt4j03yfv	cmmmrtor3000vx59k7g6k4vnc	0.00	294.41	ITBIS 18% - Factura #POS-MMPCYNNO	2026-03-13 20:37:29.816
cmmpjgvgi0006dw9k7j097hds	cmmpjgver0005dw9kz2dqt7ox	cmmmrtncz0002x59kxlcaqcu6	1590.00	0.00	Venta POS - Contado	2026-03-13 23:39:35.757
cmmpjgvgi0007dw9knw4m1zmv	cmmpjgver0005dw9kz2dqt7ox	cmmmrtpj10017x59kffk6ot4y	0.00	1347.46	Venta - Factura #POS-MMPJGU05	2026-03-13 23:39:35.757
cmmpjgvgi0008dw9k2cygihbm	cmmpjgver0005dw9kz2dqt7ox	cmmmrtor3000vx59k7g6k4vnc	0.00	242.54	ITBIS 18% - Factura #POS-MMPJGU05	2026-03-13 23:39:35.757
cmmpkdafg000ddw9kkmcei4qw	cmmpkdadn000cdw9kmg9yrthj	cmmmrtncz0002x59kxlcaqcu6	50.00	0.00	Venta POS - Contado	2026-03-14 00:04:48.15
cmmpkdafg000edw9kkjqs6tux	cmmpkdadn000cdw9kmg9yrthj	cmmmrtpj10017x59kffk6ot4y	0.00	42.37	Venta - Factura #POS-MMPKD8G2	2026-03-14 00:04:48.15
cmmpkdafg000fdw9ksu6e9qwi	cmmpkdadn000cdw9kmg9yrthj	cmmmrtor3000vx59k7g6k4vnc	0.00	7.63	ITBIS 18% - Factura #POS-MMPKD8G2	2026-03-14 00:04:48.15
cmmpkvgxl000kdw9k3aa3ypuh	cmmpkvgw0000jdw9kk3178aj0	cmmmrtncz0002x59kxlcaqcu6	50.00	0.00	Venta POS - Contado	2026-03-14 00:18:56.394
cmmpkvgxm000ldw9k9cnomrns	cmmpkvgw0000jdw9kk3178aj0	cmmmrtpj10017x59kffk6ot4y	0.00	42.37	Venta - Factura #POS-MMPKVFCF	2026-03-14 00:18:56.394
cmmpkvgxm000mdw9k4tv6koxb	cmmpkvgw0000jdw9kk3178aj0	cmmmrtor3000vx59k7g6k4vnc	0.00	7.63	ITBIS 18% - Factura #POS-MMPKVFCF	2026-03-14 00:18:56.394
cmmplain30005639kkr5tpfrg	cmmplailc0004639kv6z7ydbe	cmmmrtncz0002x59kxlcaqcu6	340.00	0.00	Venta POS - Contado	2026-03-14 00:30:38.441
cmmplain30006639kniagvzao	cmmplailc0004639kv6z7ydbe	cmmmrtpj10017x59kffk6ot4y	0.00	288.14	Venta - Factura #POS-MMPLAHCD	2026-03-14 00:30:38.441
cmmplain30007639kdebzigpr	cmmplailc0004639kv6z7ydbe	cmmmrtor3000vx59k7g6k4vnc	0.00	51.86	ITBIS 18% - Factura #POS-MMPLAHCD	2026-03-14 00:30:38.441
cmmplgl6x00043r9k66u7cfi8	cmmplgl3p00033r9kpp2bgw2r	cmmmrtncz0002x59kxlcaqcu6	50.00	0.00	Venta POS - Contado	2026-03-14 00:35:21.518
cmmplgl6x00053r9kt6ynzx0u	cmmplgl3p00033r9kpp2bgw2r	cmmmrtpj10017x59kffk6ot4y	0.00	42.37	Venta - Factura #POS-MMPLGJJO	2026-03-14 00:35:21.518
cmmplgl6x00063r9k64ozhmaj	cmmplgl3p00033r9kpp2bgw2r	cmmmrtor3000vx59k7g6k4vnc	0.00	7.63	ITBIS 18% - Factura #POS-MMPLGJJO	2026-03-14 00:35:21.518
cmmpli6zf000c3r9krkleqp18	cmmpli6xu000b3r9kl8iqg79s	cmmmrtncz0002x59kxlcaqcu6	680.00	0.00	Venta POS - Contado	2026-03-14 00:36:36.589
cmmpli6zf000d3r9kca6yl7ik	cmmpli6xu000b3r9kl8iqg79s	cmmmrtpj10017x59kffk6ot4y	0.00	576.27	Venta - Factura #POS-MMPLI5WY	2026-03-14 00:36:36.589
cmmpli6zf000e3r9kwbrxn50v	cmmpli6xu000b3r9kl8iqg79s	cmmmrtor3000vx59k7g6k4vnc	0.00	103.73	ITBIS 18% - Factura #POS-MMPLI5WY	2026-03-14 00:36:36.589
cmmplimhd000j3r9kv45l3grb	cmmplimfu000i3r9kf8afrcaz	cmmmrtncz0002x59kxlcaqcu6	340.00	0.00	Venta POS - Contado	2026-03-14 00:36:56.676
cmmplimhe000k3r9k8wq23jxd	cmmplimfu000i3r9kf8afrcaz	cmmmrtpj10017x59kffk6ot4y	0.00	288.14	Venta - Factura #POS-MMPLILER	2026-03-14 00:36:56.676
cmmplimhe000l3r9koyq9n806	cmmplimfu000i3r9kf8afrcaz	cmmmrtor3000vx59k7g6k4vnc	0.00	51.86	ITBIS 18% - Factura #POS-MMPLILER	2026-03-14 00:36:56.676
cmmplnt6y0005vl9kbfcmfkdj	cmmplnt5h0004vl9kheugzsn2	cmmmrtncz0002x59kxlcaqcu6	340.00	0.00	Venta POS - Contado	2026-03-14 00:40:58.657
cmmplnt6y0006vl9koo7lm7v4	cmmplnt5h0004vl9kheugzsn2	cmmmrtpj10017x59kffk6ot4y	0.00	288.14	Venta - Factura #POS-MMPLNRMC	2026-03-14 00:40:58.657
cmmplnt6y0007vl9kr3wp1aws	cmmplnt5h0004vl9kheugzsn2	cmmmrtor3000vx59k7g6k4vnc	0.00	51.86	ITBIS 18% - Factura #POS-MMPLNRMC	2026-03-14 00:40:58.657
cmmpluz6f0004uo9kvouu6ia5	cmmpluz3t0003uo9kncc3fut3	cmmmrtncz0002x59kxlcaqcu6	340.00	0.00	Venta POS - Contado	2026-03-14 00:46:32.857
cmmpluz6f0005uo9kcbudstkr	cmmpluz3t0003uo9kncc3fut3	cmmmrtpj10017x59kffk6ot4y	0.00	288.14	Venta - Factura #POS-MMPLUWV1	2026-03-14 00:46:32.857
cmmpluz6f0006uo9kpnbjj3hs	cmmpluz3t0003uo9kncc3fut3	cmmmrtor3000vx59k7g6k4vnc	0.00	51.86	ITBIS 18% - Factura #POS-MMPLUWV1	2026-03-14 00:46:32.857
cmmpm3ysq0006kf9ka1a5xqjr	cmmpm3yr80005kf9k17vzulgu	cmmmrtncz0002x59kxlcaqcu6	1590.00	0.00	Venta POS - Contado	2026-03-14 00:53:32.416
cmmpm3ysq0007kf9kah3l1mkk	cmmpm3yr80005kf9k17vzulgu	cmmmrtpj10017x59kffk6ot4y	0.00	1347.46	Venta - Factura #POS-MMPM3XDD	2026-03-14 00:53:32.416
cmmpm3ysr0008kf9kw62h8se9	cmmpm3yr80005kf9k17vzulgu	cmmmrtor3000vx59k7g6k4vnc	0.00	242.54	ITBIS 18% - Factura #POS-MMPM3XDD	2026-03-14 00:53:32.416
cmmqoenht00054k9kwzetft0q	cmmqoeng400044k9km73oekx8	cmmmrtncz0002x59kxlcaqcu6	340.00	0.00	Venta POS - Contado	2026-03-14 18:45:36.384
cmmqoenht00064k9ksyjhcyj3	cmmqoeng400044k9km73oekx8	cmmmrtpj10017x59kffk6ot4y	0.00	288.14	Venta - Factura #POS-MMQOEM4W	2026-03-14 18:45:36.384
cmmqoenht00074k9k32m67bic	cmmqoeng400044k9km73oekx8	cmmmrtor3000vx59k7g6k4vnc	0.00	51.86	ITBIS 18% - Factura #POS-MMQOEM4W	2026-03-14 18:45:36.384
cmmqori1c000c4k9kixk1ejsx	cmmqorhxn000b4k9k109fwq7v	cmmmrtncz0002x59kxlcaqcu6	1250.00	0.00	Venta POS - Contado	2026-03-14 18:55:35.766
cmmqori1c000d4k9kccp2igbk	cmmqorhxn000b4k9k109fwq7v	cmmmrtpj10017x59kffk6ot4y	0.00	1059.32	Venta - Factura #POS-MMQORGK6	2026-03-14 18:55:35.766
cmmqori1d000e4k9kpct27ss5	cmmqorhxn000b4k9k109fwq7v	cmmmrtor3000vx59k7g6k4vnc	0.00	190.68	ITBIS 18% - Factura #POS-MMQORGK6	2026-03-14 18:55:35.766
cmmqos2k1000j4k9k7m82vdnf	cmmqos2ii000i4k9klgm4j87a	cmmmrtncz0002x59kxlcaqcu6	2500.00	0.00	Venta POS - Contado	2026-03-14 18:56:02.342
cmmqos2k1000k4k9k5vou9c6j	cmmqos2ii000i4k9klgm4j87a	cmmmrtpj10017x59kffk6ot4y	0.00	2118.64	Venta - Factura #POS-MMQOS1AV	2026-03-14 18:56:02.342
cmmqos2k1000l4k9k5ro24dph	cmmqos2ii000i4k9klgm4j87a	cmmmrtor3000vx59k7g6k4vnc	0.00	381.36	ITBIS 18% - Factura #POS-MMQOS1AV	2026-03-14 18:56:02.342
cmmqpag550004dd9k9uxp6rp7	cmmqpag3h0003dd9knibmkkel	cmmmrtncz0002x59kxlcaqcu6	1250.00	0.00	Venta POS - Contado	2026-03-14 19:10:19.774
cmmqpag550005dd9kkgajd1xt	cmmqpag3h0003dd9knibmkkel	cmmmrtpj10017x59kffk6ot4y	0.00	1059.32	Venta - Factura #POS-MMQPAF4X	2026-03-14 19:10:19.774
cmmqpag550006dd9ka4wo8ain	cmmqpag3h0003dd9knibmkkel	cmmmrtor3000vx59k7g6k4vnc	0.00	190.68	ITBIS 18% - Factura #POS-MMQPAF4X	2026-03-14 19:10:19.774
cmmqpanz8000bdd9kwkik7c6m	cmmqpanxh000add9kjs6afsx3	cmmmrtncz0002x59kxlcaqcu6	3750.00	0.00	Venta POS - Contado	2026-03-14 19:10:29.973
cmmqpanz8000cdd9kpjffug3k	cmmqpanxh000add9kjs6afsx3	cmmmrtpj10017x59kffk6ot4y	0.00	3177.97	Venta - Factura #POS-MMQPAN3C	2026-03-14 19:10:29.973
cmmqpanz8000ddd9klh749kn9	cmmqpanxh000add9kjs6afsx3	cmmmrtor3000vx59k7g6k4vnc	0.00	572.03	ITBIS 18% - Factura #POS-MMQPAN3C	2026-03-14 19:10:29.973
cmmqpboa2000kdd9kwxrwffvt	cmmqpbo8g000jdd9kmalp4p63	cmmmrtncz0002x59kxlcaqcu6	4090.00	0.00	Venta POS - Contado	2026-03-14 19:11:17.053
cmmqpboa2000ldd9kpqdo4bh1	cmmqpbo8g000jdd9kmalp4p63	cmmmrtpj10017x59kffk6ot4y	0.00	3466.10	Venta - Factura #POS-MMQPBN9C	2026-03-14 19:11:17.053
cmmqpboa2000mdd9kr244hv4g	cmmqpbo8g000jdd9kmalp4p63	cmmmrtor3000vx59k7g6k4vnc	0.00	623.90	ITBIS 18% - Factura #POS-MMQPBN9C	2026-03-14 19:11:17.053
cmmqphdsd000rdd9kp3rfvvy2	cmmqphdqu000qdd9kbidirpoe	cmmmrtncz0002x59kxlcaqcu6	1250.00	0.00	Venta POS - Contado	2026-03-14 19:15:43.393
cmmqphdsd000sdd9kz8oy5s2v	cmmqphdqu000qdd9kbidirpoe	cmmmrtpj10017x59kffk6ot4y	0.00	1059.32	Venta - Factura #POS-MMQPHCYX	2026-03-14 19:15:43.393
cmmqphdsd000tdd9kr8owqjep	cmmqphdqu000qdd9kbidirpoe	cmmmrtor3000vx59k7g6k4vnc	0.00	190.68	ITBIS 18% - Factura #POS-MMQPHCYX	2026-03-14 19:15:43.393
cmmqpqjsd000ydd9kzow11esg	cmmqpqjqf000xdd9kec5klfu8	cmmmrtncz0002x59kxlcaqcu6	1250.00	0.00	Venta POS - Contado	2026-03-14 19:22:51.019
cmmqpqjsd000zdd9kotu1p6au	cmmqpqjqf000xdd9kec5klfu8	cmmmrtpj10017x59kffk6ot4y	0.00	1059.32	Venta - Factura #POS-MMQPQIR1	2026-03-14 19:22:51.019
cmmqpqjsd0010dd9kknclthmh	cmmqpqjqf000xdd9kec5klfu8	cmmmrtor3000vx59k7g6k4vnc	0.00	190.68	ITBIS 18% - Factura #POS-MMQPQIR1	2026-03-14 19:22:51.019
cmmqpusuw0015dd9kdly8w808	cmmqpuste0014dd9ktgbf5kaw	cmmmrtncz0002x59kxlcaqcu6	1250.00	0.00	Venta POS - Contado	2026-03-14 19:26:09.455
cmmqpusux0016dd9ki8y5b717	cmmqpuste0014dd9ktgbf5kaw	cmmmrtpj10017x59kffk6ot4y	0.00	1059.32	Venta - Factura #POS-MMQPUS07	2026-03-14 19:26:09.455
cmmqpusux0017dd9k75v29l9j	cmmqpuste0014dd9ktgbf5kaw	cmmmrtor3000vx59k7g6k4vnc	0.00	190.68	ITBIS 18% - Factura #POS-MMQPUS07	2026-03-14 19:26:09.455
cmmqpy0hr001ddd9keczcpjxi	cmmqpy0g8001cdd9kuiyn7f7a	cmmmrtncz0002x59kxlcaqcu6	340.00	0.00	Venta POS - Contado	2026-03-14 19:28:39.317
cmmqpy0hr001edd9kwi86slg9	cmmqpy0g8001cdd9kuiyn7f7a	cmmmrtpj10017x59kffk6ot4y	0.00	288.14	Venta - Factura #POS-MMQPXZI3	2026-03-14 19:28:39.317
cmmqpy0hr001fdd9ke4w1yefh	cmmqpy0g8001cdd9kuiyn7f7a	cmmmrtor3000vx59k7g6k4vnc	0.00	51.86	ITBIS 18% - Factura #POS-MMQPXZI3	2026-03-14 19:28:39.317
cmmqscdbc000409l46wb7g178	cmmqscdas000309l4j976b3af	cmmmrtncz0002x59kxlcaqcu6	1250.00	0.00	Venta POS - Contado	2026-03-14 20:35:48.419
cmmqscdbd000509l42axpkgpe	cmmqscdas000309l4j976b3af	cmmmrtpj10017x59kffk6ot4y	0.00	1059.32	Venta - Factura #POS-MMQSCCTW	2026-03-14 20:35:48.419
cmmqscdbd000609l4aebmzsaa	cmmqscdas000309l4j976b3af	cmmmrtor3000vx59k7g6k4vnc	0.00	190.68	ITBIS 18% - Factura #POS-MMQSCCTW	2026-03-14 20:35:48.419
cmms5q3le0004jpgr0pe338sv	cmms5q3je0003jpgrcs2wwulg	cmmmrtncz0002x59kxlcaqcu6	35.00	0.00	Venta POS - Contado	2026-03-15 19:38:10.1
cmms5q3le0005jpgrpr51f2s1	cmms5q3je0003jpgrcs2wwulg	cmmmrtpj10017x59kffk6ot4y	0.00	29.66	Venta - Factura #POS-MMS5Q2A3	2026-03-15 19:38:10.1
cmms5q3le0006jpgr3r67p9rs	cmms5q3je0003jpgrcs2wwulg	cmmmrtor3000vx59k7g6k4vnc	0.00	5.34	ITBIS 18% - Factura #POS-MMS5Q2A3	2026-03-15 19:38:10.1
cmms6aj1c000ajpgrtgcga4ao	cmms6aizj0009jpgr7mq67g0d	cmmmrtnq50009x59k5so5b69a	41.30	0.00	Cliente: Damian Vasquez	2026-03-15 19:54:03.24
cmms6aj1c000bjpgr49c096vk	cmms6aizj0009jpgr7mq67g0d	cmmmrtpj10017x59kffk6ot4y	0.00	35.00	Venta - Factura #FE-1104	2026-03-15 19:54:03.24
cmms6aj1d000cjpgr65kppz9y	cmms6aizj0009jpgr7mq67g0d	cmmmrtor3000vx59k7g6k4vnc	0.00	6.30	ITBIS 18% - Factura #FE-1104	2026-03-15 19:54:03.24
cmms6cxjh000ijpgrhzq0o0pw	cmms6cxhw000hjpgrf1je7so8	cmmmrtncz0002x59kxlcaqcu6	35.00	0.00	Venta POS - Contado	2026-03-15 19:55:55.36
cmms6cxjh000jjpgrc87d5pvg	cmms6cxhw000hjpgrf1je7so8	cmmmrtpj10017x59kffk6ot4y	0.00	29.66	Venta - Factura #POS-MMS6CW7T	2026-03-15 19:55:55.36
cmms6cxjh000kjpgry7rl9re2	cmms6cxhw000hjpgrf1je7so8	cmmmrtor3000vx59k7g6k4vnc	0.00	5.34	ITBIS 18% - Factura #POS-MMS6CW7T	2026-03-15 19:55:55.36
cmms6rh0f000rjpgr23cvuxhf	cmms6rguk000qjpgr5lf9psc2	cmmmrtncz0002x59kxlcaqcu6	35.00	0.00	Venta POS - Contado	2026-03-15 20:07:13.626
cmms6rh0f000sjpgrkqr6lwc4	cmms6rguk000qjpgr5lf9psc2	cmmmrtpj10017x59kffk6ot4y	0.00	29.66	Venta - Factura #POS-MMS6RDXT	2026-03-15 20:07:13.626
cmms6rh0f000tjpgrm3qnch7o	cmms6rguk000qjpgr5lf9psc2	cmmmrtor3000vx59k7g6k4vnc	0.00	5.34	ITBIS 18% - Factura #POS-MMS6RDXT	2026-03-15 20:07:13.626
cmms700ki000yjpgrbt9pqljk	cmms7009m000xjpgrqomywb0o	cmmmrtncz0002x59kxlcaqcu6	35.00	0.00	Venta POS - Contado	2026-03-15 20:13:51.968
cmms700ki000zjpgro2omeg79	cmms7009m000xjpgrqomywb0o	cmmmrtpj10017x59kffk6ot4y	0.00	29.66	Venta - Factura #POS-MMS6ZXOP	2026-03-15 20:13:51.968
cmms700ki0010jpgrjx0zx8lk	cmms7009m000xjpgrqomywb0o	cmmmrtor3000vx59k7g6k4vnc	0.00	5.34	ITBIS 18% - Factura #POS-MMS6ZXOP	2026-03-15 20:13:51.968
\.


--
-- Data for Name: Membership; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Membership" (id, "userId", "organizationId", "createdAt", "updatedAt", "roleId", "systemRole") FROM stdin;
cmlz6982d0002wagsc7d4vzv6	cmlz6980u0001wagsy7xrc0kl	cmlz697r20000wagscgomewla	2026-02-23 12:47:43.222	2026-02-23 12:47:43.222	\N	USER
cmmfm4835000d6wgua3ospzkt	cmmfm481i000c6wguzgkffc3o	cmmfm47zq000b6wguce0ksde1	2026-03-07 00:56:02.801	2026-03-07 00:56:02.801	\N	USER
cmmgbm2zu00025oguvei4un92	cmmgbm2y700015oguiy7sb7zt	cmmgbm2w200005oguyog2txmn	2026-03-07 12:49:46.41	2026-03-07 12:49:46.41	\N	USER
cmmgfgyp50002ya9kmjikllpq	cmmgfgynl0001ya9kbepw2pbc	cmmgfgyls0000ya9ku8467h0r	2026-03-07 14:37:46.025	2026-03-07 14:37:46.025	\N	ADMIN
\.


--
-- Data for Name: Notification; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Notification" (id, "organizationId", "userId", type, title, message, link, "entityType", "entityId", "isRead", "readAt", priority, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Organization; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Organization" (id, name, slug, "createdAt", "updatedAt", plan) FROM stdin;
cmlz697r20000wagscgomewla	Davasoft S.A.S	davasoft-sas	2026-02-23 12:47:42.466	2026-02-23 12:47:42.466	FREE
cmmfm47zq000b6wguce0ksde1	Empresa prueba1	empresa-prueba1-5539	2026-03-07 00:56:02.678	2026-03-07 00:56:02.678	FREE
cmmgbm2w200005oguyog2txmn	Prueba 2	prueba-2-5850	2026-03-07 12:49:46.274	2026-03-07 12:49:46.274	PRO
cmmgfgyls0000ya9ku8467h0r	Prueba 3	prueba-3-1392	2026-03-07 14:37:45.904	2026-03-07 14:37:45.904	ENTERPRISE
\.


--
-- Data for Name: POSConfig; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."POSConfig" (id, "organizationId", "posType", "printFormat", "printCopies", "autoPrint", "showLogo", "defaultClientId", "defaultTaxRate", "taxIncluded", "isActive", "createdAt", "updatedAt") FROM stdin;
cmmpl601g0000639kfroc8ton	cmlz697r20000wagscgomewla	SPLIT	HALF_LETTER	1	f	t	cmme68zvm0000lp9k3lfop3js	18.00	t	t	2026-03-14 00:27:07.828	2026-03-14 19:28:49.405
\.


--
-- Data for Name: Payment; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Payment" (id, amount, date, method, "invoiceId", "expenseId", "createdAt", reference, "updatedAt", "shiftId") FROM stdin;
cmmmu0khn000wqt9kudaak784	25000.00	2026-03-12 00:00:00	BANK_TRANSFER	\N	cmme6ny0f0001lp9k69pm53ph	2026-03-12 02:11:32.41	10000-0254	2026-03-12 02:11:32.41	\N
cmmmvq81g000cui9kgjg2ebtk	487.50	2026-03-12 00:00:00	CASH	cmmmvp6si0006ui9kclovtf8y	\N	2026-03-12 02:59:28.947	\N	2026-03-12 02:59:28.947	\N
\.


--
-- Data for Name: Product; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Product" (id, "organizationId", name, description, price, stock, sku, "categoryId", "createdAt", "updatedAt", cost, "costMethod", "minStock", "attributeTemplateId", "hasAttributes", "productType") FROM stdin;
prod-cmlz697r20000wagscgomewla-estante	cmlz697r20000wagscgomewla	Estante de Madera	\N	1200.00	0	MUEBLE-EST-001	cat-cmlz697r20000wagscgomewla-furniture	2026-03-14 21:28:26.675	2026-03-14 21:28:26.675	0.00	AVERAGE	0	\N	t	FINISHED
cmmfjgbiq0003xxgu2nzut5mr	cmlz697r20000wagscgomewla	Teclado Mec		50.00	0	TM-001	cmlz698bk0003wags2ntcwx26	2026-03-06 23:41:28.273	2026-03-14 00:35:20.698	0.00	AVERAGE	0	\N	f	FINISHED
cmms6ev5w000ljpgro3vytfmk	cmlz697r20000wagscgomewla	Memoria ram		1500.00	10	REF-0215	cmlz698bk0003wags2ntcwx26	2026-03-15 19:57:25.7	2026-03-15 19:57:25.7	1000.00	AVERAGE	0	\N	f	FINISHED
prod-cmlz697r20000wagscgomewla-bisagra	cmlz697r20000wagscgomewla	Bisagra de Acero	\N	35.00	996	MP-BISAGRA-001	cat-cmlz697r20000wagscgomewla-raw	2026-03-14 21:28:26.352	2026-03-15 20:13:50.537	18.00	AVERAGE	100	\N	f	FINISHED
cmlz6996h0007wagsa4rqslxf	cmlz697r20000wagscgomewla	Servicios Cloud AWS	Hosting y servicios en la nube	340.00	90	SERV-CLOUD	cmlz698ja0004wagsf69gktby	2026-02-23 12:47:44.719	2026-03-14 19:28:38.815	0.00	AVERAGE	0	\N	f	FINISHED
cmlz699dt0008wagsjxhvy7tc	cmlz697r20000wagscgomewla	Laptop Dell XPS 13	Computador portátil de alto rendimiento	1250.00	184	HARD-LAP-01	cmlz698bk0003wags2ntcwx26	2026-02-23 12:47:44.985	2026-03-14 20:35:48.26	0.00	AVERAGE	0	\N	f	FINISHED
prod-cmlz697r20000wagscgomewla-tornillo	cmlz697r20000wagscgomewla	Tornillo Autoperforante	\N	0.50	10000	MP-TORNILLO-001	cat-cmlz697r20000wagscgomewla-raw	2026-03-14 21:28:25.264	2026-03-14 21:28:25.264	0.25	AVERAGE	1000	\N	f	FINISHED
prod-cmlz697r20000wagscgomewla-perfil	cmlz697r20000wagscgomewla	Perfil de Aluminio 1 pulgada	\N	150.00	500	MP-PERFIL-ALU-001	cat-cmlz697r20000wagscgomewla-raw	2026-03-14 21:28:25.258	2026-03-14 21:28:25.258	85.00	AVERAGE	50	\N	f	FINISHED
prod-cmlz697r20000wagscgomewla-vidrio	cmlz697r20000wagscgomewla	Vidrio Transparente 4mm	\N	450.00	200	MP-VIDRIO-001	cat-cmlz697r20000wagscgomewla-raw	2026-03-14 21:28:25.26	2026-03-14 21:28:25.26	280.00	AVERAGE	20	\N	f	FINISHED
prod-cmlz697r20000wagscgomewla-sellador	cmlz697r20000wagscgomewla	Sellador de Silicón	\N	45.00	150	MP-SELLADOR-001	cat-cmlz697r20000wagscgomewla-raw	2026-03-14 21:28:25.266	2026-03-14 21:28:25.266	25.00	AVERAGE	20	\N	f	FINISHED
prod-cmlz697r20000wagscgomewla-vinilo	cmlz697r20000wagscgomewla	Vinilo de Goma	\N	25.00	300	MP-VINILO-001	cat-cmlz697r20000wagscgomewla-raw	2026-03-14 21:28:25.268	2026-03-14 21:28:25.268	12.00	AVERAGE	50	\N	f	FINISHED
prod-cmlz697r20000wagscgomewla-burlete	cmlz697r20000wagscgomewla	Burlete de Espuma	\N	15.00	500	MP-BURLETE-001	cat-cmlz697r20000wagscgomewla-raw	2026-03-14 21:28:25.269	2026-03-14 21:28:25.269	8.00	AVERAGE	100	\N	f	FINISHED
prod-cmlz697r20000wagscgomewla-ventana	cmlz697r20000wagscgomewla	Ventana de Aluminum	\N	2500.00	0	VENTANA-ALU-001	cat-cmlz697r20000wagscgomewla-windows	2026-03-14 21:28:25.589	2026-03-14 21:28:25.589	0.00	AVERAGE	0	\N	t	FINISHED
prod-cmlz697r20000wagscgomewla-tornilloMad	cmlz697r20000wagscgomewla	Tornillo para Madera	\N	0.30	20000	MP-TORNILLO-MAD-001	cat-cmlz697r20000wagscgomewla-raw	2026-03-14 21:28:26.353	2026-03-14 21:28:26.353	0.15	AVERAGE	2000	\N	f	FINISHED
prod-cmlz697r20000wagscgomewla-madera	cmlz697r20000wagscgomewla	Tabla de Madera Pino	\N	350.00	100	MP-MADERA-001	cat-cmlz697r20000wagscgomewla-raw	2026-03-14 21:28:26.346	2026-03-14 21:28:26.346	180.00	AVERAGE	10	\N	f	FINISHED
prod-cmlz697r20000wagscgomewla-manija	cmlz697r20000wagscgomewla	Manija de Acero Inoxidable	\N	85.00	500	MP-MANija-001	cat-cmlz697r20000wagscgomewla-raw	2026-03-14 21:28:26.35	2026-03-14 21:28:26.35	45.00	AVERAGE	50	\N	f	FINISHED
prod-cmlz697r20000wagscgomewla-plywood	cmlz697r20000wagscgomewla	Triplay 15mm	\N	480.00	80	MP-PLYWOOD-001	cat-cmlz697r20000wagscgomewla-raw	2026-03-14 21:28:26.348	2026-03-14 21:28:26.348	290.00	AVERAGE	10	\N	f	FINISHED
\.


--
-- Data for Name: ProductAlert; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."ProductAlert" (id, "productId", "warehouseId", "minQuantity", "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ProductAttribute; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."ProductAttribute" (id, "organizationId", name, code, type, unit, "defaultValue", options, "isRequired", "isGlobal", "createdAt", "updatedAt") FROM stdin;
attr-cmlz697r20000wagscgomewla-height	cmlz697r20000wagscgomewla	Alto	height	number	m	\N	\N	t	t	2026-03-14 21:28:24.522	2026-03-14 21:28:24.522
attr-cmlz697r20000wagscgomewla-width	cmlz697r20000wagscgomewla	Ancho	width	number	m	\N	\N	t	t	2026-03-14 21:28:24.522	2026-03-14 21:28:24.522
attr-cmlz697r20000wagscgomewla-depth	cmlz697r20000wagscgomewla	Profundidad	depth	number	m	\N	\N	f	t	2026-03-14 21:28:24.525	2026-03-14 21:28:24.525
attr-cmlz697r20000wagscgomewla-material	cmlz697r20000wagscgomewla	Material	material	select	\N	\N	["Aluminio","PVC","Madera"]	t	t	2026-03-14 21:28:24.527	2026-03-14 21:28:24.527
attr-cmlz697r20000wagscgomewla-color	cmlz697r20000wagscgomewla	Color	color	select	\N	\N	["Blanco","Negro","Gris","Madera"]	t	t	2026-03-14 21:28:24.527	2026-03-14 21:28:24.527
attr-cmlz697r20000wagscgomewla-glass_type	cmlz697r20000wagscgomewla	Tipo de Vidrio	glass_type	select	\N	\N	["Transparente","Templado","Laminado"]	t	t	2026-03-14 21:28:24.527	2026-03-14 21:28:24.527
\.


--
-- Data for Name: ProductAttributeValue; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."ProductAttributeValue" (id, "productId", "attributeId", value) FROM stdin;
\.


--
-- Data for Name: ProductionConsumption; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."ProductionConsumption" (id, "productionOrderId", "componentId", "quantityRequired", "quantityConsumed", "createdAt") FROM stdin;
\.


--
-- Data for Name: ProductionOrder; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."ProductionOrder" (id, "organizationId", number, "productId", quantity, attributes, status, "totalCost", "plannedDate", "startDate", "endDate", notes, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ReconciliationItem; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."ReconciliationItem" (id, "reconciliationId", "transactionId", "transactionType", description, reference, "statementDate", "statementAmount", "systemAmount", matched, "matchDate", "createdAt") FROM stdin;
\.


--
-- Data for Name: Retention; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Retention" (id, "organizationId", name, type, percentage, description, "accountPayableId", "accountReceivableId", "appliesTo", "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: RetentionCertificate; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."RetentionCertificate" (id, "organizationId", "retentionId", "certificateNumber", date, "agentName", "agentTaxId", "agentAddress", "beneficiaryName", "beneficiaryTaxId", "beneficiaryAddress", "totalAmount", "retainedAmount", concept, period, "journalEntryId", "createdAt") FROM stdin;
\.


--
-- Data for Name: Role; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Role" (id, name, description, permissions, "organizationId", "createdAt", "updatedAt") FROM stdin;
cmmgcivqs0000t9guqtyu083o	Vendedor	\N	{sales:view,pos:access,estimates:view,estimates:create,estimates:edit}	cmlz697r20000wagscgomewla	2026-03-07 13:15:16.66	2026-03-07 13:15:16.66
cmmgfic740003ya9kgkeiv4wc	Vendedor	\N	{sales:view,pos:access,estimates:view,estimates:create,estimates:edit,inventory:view}	cmmgfgyls0000ya9ku8467h0r	2026-03-07 14:38:50.176	2026-03-07 14:38:50.176
\.


--
-- Data for Name: Session; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Session" (id, "sessionToken", "userId", expires) FROM stdin;
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."User" (id, name, email, "emailVerified", image, password, "createdAt", "updatedAt", role) FROM stdin;
cmmfm481i000c6wguzgkffc3o	Empresa prueba1	cosmevasquez3103@gmail.com	\N	\N	$2b$10$Vh8PxpE46UhJO3TQted5POs0AmkGiPQOJrxwmXJoCvB03kFTDJa22	2026-03-07 00:56:02.742	2026-03-07 00:56:02.742	USER
cmmgbm2y700015oguiy7sb7zt	JOSE	jose@jose.com	\N	\N	$2b$10$koOt1OQbXxdtquo9bLMpZuZLiD/cA2Hd1t4JJ3.qkWGM19bfbj7yi	2026-03-07 12:49:46.351	2026-03-07 12:49:46.351	USER
cmmgfgynl0001ya9kbepw2pbc	pepito	pepito@pepito.com	\N	\N	$2b$10$ZyNStFo4u9qeTerxXxvxyeI79IdRimqS6r5oDYTg/VrT9.hiH9uuK	2026-03-07 14:37:45.969	2026-03-07 14:37:45.969	ADMIN
cmlz6980u0001wagsy7xrc0kl	Administrador Davasoft	admin@davasoft.com	\N	\N	$2b$10$As7rxODl9JhNi0e7qcMGTePh5hGmRKuZHPKrPvEi1rkAvF6bxx0BO	2026-02-23 12:47:43.222	2026-03-17 12:47:31.06	USER
\.


--
-- Data for Name: Vehicle; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Vehicle" (id, "organizationId", "clientId", brand, model, year, color, plates, vin, mileage, "cameWithTow", "createdAt", "updatedAt") FROM stdin;
test-vehicle-2	cmlz697r20000wagscgomewla	cmmulxufm001t2q9k9e8hhvgs	Honda	Civic	2022	Azul	BBB-002	2HGES16534H592611	25000	f	2026-03-17 12:47:37.999	2026-03-17 12:47:37.999
test-vehicle-1	cmlz697r20000wagscgomewla	cmmulxu5r001s2q9kyyuxomk3	Toyota	Corolla	2020	Rojo	AAA-001	1HGBH41JXMN109186	45000	f	2026-03-17 12:47:37.999	2026-03-17 12:47:37.999
test-vehicle-3	cmlz697r20000wagscgomewla	cmmulxug9001u2q9k96n5gqoy	Hyundai	Tucson	2021	Negro	CCC-003	KM8JU3AC0DU543217	38000	t	2026-03-17 12:47:37.999	2026-03-17 12:47:37.999
test-vehicle-4	cmlz697r20000wagscgomewla	cmmulxu5r001s2q9kyyuxomk3	Kia	Sportage	2023	Blanco	DDD-004	5XYZG3AG5DG123456	15000	f	2026-03-17 12:47:37.999	2026-03-17 12:47:37.999
cmmum29q10000cg9kngzk10r6	cmlz697r20000wagscgomewla	cmmulxug9001u2q9k96n5gqoy	Toyota	RAV4	\N	Gris	A1312054	\N	0	f	2026-03-17 12:51:04.249	2026-03-17 12:51:04.249
\.


--
-- Data for Name: VerificationToken; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."VerificationToken" (identifier, token, expires) FROM stdin;
\.


--
-- Data for Name: Warehouse; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Warehouse" (id, "organizationId", name, address, "isDefault", "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: WorkOrder; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."WorkOrder" (id, "organizationId", "vehicleId", "clientId", number, "entryDate", "exitDate", "fuelLevel", "cameWithTow", description, "workItems", inventory, "preExistingDamage", notes, "invoiceId", "createdById", "createdAt", "updatedAt", status, "mechanicId", "assignedAt", "startedAt", "completedAt", "deliveredAt") FROM stdin;
test-workorder-1	cmlz697r20000wagscgomewla	test-vehicle-1	cmmulxu5r001s2q9kyyuxomk3	OS-0001	2026-03-10 12:47:38.591	2026-03-12 12:47:38.591	75	f	Cambio de aceite y filtro	[{"description":"Cambio de aceite","cost":1500,"completed":true},{"description":"Cambio de filtro de aire","cost":500,"completed":true}]	{"speedometer":true,"radio":true,"spareTire":true,"jack":true}	\N	Cliente satisfecho	\N	cmlz6980u0001wagsy7xrc0kl	2026-03-17 12:47:38.594	2026-03-17 12:47:38.594	FINISHED	\N	\N	\N	\N	\N
test-workorder-3	cmlz697r20000wagscgomewla	test-vehicle-3	cmmulxug9001u2q9k96n5gqoy	OS-0003	2026-03-17 12:47:39.129	\N	25	t	Servicio de mantenimiento general	[{"description":"Cambio de aceite","cost":1500,"completed":false},{"description":"Rotación de neumáticos","cost":600,"completed":false},{"description":"Check-up completo","cost":1200,"completed":false}]	{"speedometer":true,"radio":true,"spareTire":false,"jack":false,"documents":true}	\N	Vehículo vino en grúa, revisar daños	\N	cmlz6980u0001wagsy7xrc0kl	2026-03-17 12:47:39.13	2026-03-21 19:35:55.315	FINISHED	\N	\N	\N	2026-03-21 19:35:55.312	\N
test-workorder-2	cmlz697r20000wagscgomewla	test-vehicle-2	cmmulxufm001t2q9k9e8hhvgs	OS-0002	2026-03-15 12:47:38.864	\N	50	f	Diagnóstico y reparación de sistema de frenos	[{"description":"Revisión de frenos","cost":800,"completed":true},{"description":"Cambio de pastillas","cost":2500,"completed":false},{"description":"Alineación","cost":1000,"completed":false}]	{"speedometer":true,"radio":true,"spareTire":true,"tools":false}	\N	Esperando repuestos	\N	cmlz6980u0001wagsy7xrc0kl	2026-03-17 12:47:38.867	2026-03-22 00:12:05.332	RECEIVED	\N	\N	2026-03-21 22:05:40.834	2026-03-21 17:56:38.672	\N
\.


--
-- Data for Name: WorkOrderAssignment; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."WorkOrderAssignment" (id, "workOrderId", "userId", task, "estimatedHours", "actualHours", status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Name: Account Account_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_pkey" PRIMARY KEY (id);


--
-- Name: AccountingAccount AccountingAccount_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."AccountingAccount"
    ADD CONSTRAINT "AccountingAccount_pkey" PRIMARY KEY (id);


--
-- Name: ActivityLog ActivityLog_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."ActivityLog"
    ADD CONSTRAINT "ActivityLog_pkey" PRIMARY KEY (id);


--
-- Name: AssetCategory AssetCategory_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."AssetCategory"
    ADD CONSTRAINT "AssetCategory_pkey" PRIMARY KEY (id);


--
-- Name: AssetDepreciation AssetDepreciation_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."AssetDepreciation"
    ADD CONSTRAINT "AssetDepreciation_pkey" PRIMARY KEY (id);


--
-- Name: BankAccount BankAccount_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."BankAccount"
    ADD CONSTRAINT "BankAccount_pkey" PRIMARY KEY (id);


--
-- Name: BankReconciliation BankReconciliation_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."BankReconciliation"
    ADD CONSTRAINT "BankReconciliation_pkey" PRIMARY KEY (id);


--
-- Name: BankStatementImport BankStatementImport_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."BankStatementImport"
    ADD CONSTRAINT "BankStatementImport_pkey" PRIMARY KEY (id);


--
-- Name: BillOfMaterials BillOfMaterials_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."BillOfMaterials"
    ADD CONSTRAINT "BillOfMaterials_pkey" PRIMARY KEY (id);


--
-- Name: BoMItem BoMItem_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."BoMItem"
    ADD CONSTRAINT "BoMItem_pkey" PRIMARY KEY (id);


--
-- Name: CashClosure CashClosure_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."CashClosure"
    ADD CONSTRAINT "CashClosure_pkey" PRIMARY KEY (id);


--
-- Name: CashDrawerShift CashDrawerShift_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."CashDrawerShift"
    ADD CONSTRAINT "CashDrawerShift_pkey" PRIMARY KEY (id);


--
-- Name: Category Category_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_pkey" PRIMARY KEY (id);


--
-- Name: Check Check_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Check"
    ADD CONSTRAINT "Check_pkey" PRIMARY KEY (id);


--
-- Name: ClientFiscalData ClientFiscalData_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."ClientFiscalData"
    ADD CONSTRAINT "ClientFiscalData_pkey" PRIMARY KEY (id);


--
-- Name: Client Client_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Client"
    ADD CONSTRAINT "Client_pkey" PRIMARY KEY (id);


--
-- Name: CostCenter CostCenter_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."CostCenter"
    ADD CONSTRAINT "CostCenter_pkey" PRIMARY KEY (id);


--
-- Name: EstimateItem EstimateItem_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."EstimateItem"
    ADD CONSTRAINT "EstimateItem_pkey" PRIMARY KEY (id);


--
-- Name: Estimate Estimate_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Estimate"
    ADD CONSTRAINT "Estimate_pkey" PRIMARY KEY (id);


--
-- Name: ExchangeRateAdjustment ExchangeRateAdjustment_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."ExchangeRateAdjustment"
    ADD CONSTRAINT "ExchangeRateAdjustment_pkey" PRIMARY KEY (id);


--
-- Name: ExpenseItem ExpenseItem_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."ExpenseItem"
    ADD CONSTRAINT "ExpenseItem_pkey" PRIMARY KEY (id);


--
-- Name: Expense Expense_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Expense"
    ADD CONSTRAINT "Expense_pkey" PRIMARY KEY (id);


--
-- Name: FixedAsset FixedAsset_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."FixedAsset"
    ADD CONSTRAINT "FixedAsset_pkey" PRIMARY KEY (id);


--
-- Name: Income Income_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Income"
    ADD CONSTRAINT "Income_pkey" PRIMARY KEY (id);


--
-- Name: InventoryMovement InventoryMovement_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."InventoryMovement"
    ADD CONSTRAINT "InventoryMovement_pkey" PRIMARY KEY (id);


--
-- Name: InventoryWarehouse InventoryWarehouse_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."InventoryWarehouse"
    ADD CONSTRAINT "InventoryWarehouse_pkey" PRIMARY KEY (id);


--
-- Name: InvoiceItem InvoiceItem_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."InvoiceItem"
    ADD CONSTRAINT "InvoiceItem_pkey" PRIMARY KEY (id);


--
-- Name: Invoice Invoice_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Invoice"
    ADD CONSTRAINT "Invoice_pkey" PRIMARY KEY (id);


--
-- Name: JournalEntry JournalEntry_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."JournalEntry"
    ADD CONSTRAINT "JournalEntry_pkey" PRIMARY KEY (id);


--
-- Name: JournalLine JournalLine_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."JournalLine"
    ADD CONSTRAINT "JournalLine_pkey" PRIMARY KEY (id);


--
-- Name: Membership Membership_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Membership"
    ADD CONSTRAINT "Membership_pkey" PRIMARY KEY (id);


--
-- Name: Notification Notification_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_pkey" PRIMARY KEY (id);


--
-- Name: Organization Organization_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Organization"
    ADD CONSTRAINT "Organization_pkey" PRIMARY KEY (id);


--
-- Name: POSConfig POSConfig_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."POSConfig"
    ADD CONSTRAINT "POSConfig_pkey" PRIMARY KEY (id);


--
-- Name: Payment Payment_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_pkey" PRIMARY KEY (id);


--
-- Name: ProductAlert ProductAlert_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."ProductAlert"
    ADD CONSTRAINT "ProductAlert_pkey" PRIMARY KEY (id);


--
-- Name: ProductAttributeValue ProductAttributeValue_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."ProductAttributeValue"
    ADD CONSTRAINT "ProductAttributeValue_pkey" PRIMARY KEY (id);


--
-- Name: ProductAttribute ProductAttribute_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."ProductAttribute"
    ADD CONSTRAINT "ProductAttribute_pkey" PRIMARY KEY (id);


--
-- Name: Product Product_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_pkey" PRIMARY KEY (id);


--
-- Name: ProductionConsumption ProductionConsumption_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."ProductionConsumption"
    ADD CONSTRAINT "ProductionConsumption_pkey" PRIMARY KEY (id);


--
-- Name: ProductionOrder ProductionOrder_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."ProductionOrder"
    ADD CONSTRAINT "ProductionOrder_pkey" PRIMARY KEY (id);


--
-- Name: ReconciliationItem ReconciliationItem_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."ReconciliationItem"
    ADD CONSTRAINT "ReconciliationItem_pkey" PRIMARY KEY (id);


--
-- Name: RetentionCertificate RetentionCertificate_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."RetentionCertificate"
    ADD CONSTRAINT "RetentionCertificate_pkey" PRIMARY KEY (id);


--
-- Name: Retention Retention_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Retention"
    ADD CONSTRAINT "Retention_pkey" PRIMARY KEY (id);


--
-- Name: Role Role_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Role"
    ADD CONSTRAINT "Role_pkey" PRIMARY KEY (id);


--
-- Name: Session Session_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: Vehicle Vehicle_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Vehicle"
    ADD CONSTRAINT "Vehicle_pkey" PRIMARY KEY (id);


--
-- Name: Warehouse Warehouse_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Warehouse"
    ADD CONSTRAINT "Warehouse_pkey" PRIMARY KEY (id);


--
-- Name: WorkOrderAssignment WorkOrderAssignment_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."WorkOrderAssignment"
    ADD CONSTRAINT "WorkOrderAssignment_pkey" PRIMARY KEY (id);


--
-- Name: WorkOrder WorkOrder_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."WorkOrder"
    ADD CONSTRAINT "WorkOrder_pkey" PRIMARY KEY (id);


--
-- Name: Account_provider_providerAccountId_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON public."Account" USING btree (provider, "providerAccountId");


--
-- Name: AccountingAccount_organizationId_code_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "AccountingAccount_organizationId_code_key" ON public."AccountingAccount" USING btree ("organizationId", code);


--
-- Name: AccountingAccount_organizationId_parentId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "AccountingAccount_organizationId_parentId_idx" ON public."AccountingAccount" USING btree ("organizationId", "parentId");


--
-- Name: AccountingAccount_organizationId_type_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "AccountingAccount_organizationId_type_idx" ON public."AccountingAccount" USING btree ("organizationId", type);


--
-- Name: ActivityLog_organizationId_createdAt_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "ActivityLog_organizationId_createdAt_idx" ON public."ActivityLog" USING btree ("organizationId", "createdAt");


--
-- Name: ActivityLog_organizationId_module_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "ActivityLog_organizationId_module_idx" ON public."ActivityLog" USING btree ("organizationId", module);


--
-- Name: ActivityLog_organizationId_userId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "ActivityLog_organizationId_userId_idx" ON public."ActivityLog" USING btree ("organizationId", "userId");


--
-- Name: AssetCategory_organizationId_code_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "AssetCategory_organizationId_code_key" ON public."AssetCategory" USING btree ("organizationId", code);


--
-- Name: AssetCategory_organizationId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "AssetCategory_organizationId_idx" ON public."AssetCategory" USING btree ("organizationId");


--
-- Name: AssetDepreciation_assetId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "AssetDepreciation_assetId_idx" ON public."AssetDepreciation" USING btree ("assetId");


--
-- Name: AssetDepreciation_assetId_period_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "AssetDepreciation_assetId_period_key" ON public."AssetDepreciation" USING btree ("assetId", period);


--
-- Name: AssetDepreciation_organizationId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "AssetDepreciation_organizationId_idx" ON public."AssetDepreciation" USING btree ("organizationId");


--
-- Name: BankAccount_organizationId_accountNumber_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "BankAccount_organizationId_accountNumber_key" ON public."BankAccount" USING btree ("organizationId", "accountNumber");


--
-- Name: BankAccount_organizationId_status_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "BankAccount_organizationId_status_idx" ON public."BankAccount" USING btree ("organizationId", status);


--
-- Name: BankReconciliation_bankAccountId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "BankReconciliation_bankAccountId_idx" ON public."BankReconciliation" USING btree ("bankAccountId");


--
-- Name: BankReconciliation_organizationId_date_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "BankReconciliation_organizationId_date_idx" ON public."BankReconciliation" USING btree ("organizationId", date);


--
-- Name: BankReconciliation_organizationId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "BankReconciliation_organizationId_idx" ON public."BankReconciliation" USING btree ("organizationId");


--
-- Name: BankStatementImport_bankAccountId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "BankStatementImport_bankAccountId_idx" ON public."BankStatementImport" USING btree ("bankAccountId");


--
-- Name: BankStatementImport_organizationId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "BankStatementImport_organizationId_idx" ON public."BankStatementImport" USING btree ("organizationId");


--
-- Name: BankStatementImport_status_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "BankStatementImport_status_idx" ON public."BankStatementImport" USING btree (status);


--
-- Name: BillOfMaterials_organizationId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "BillOfMaterials_organizationId_idx" ON public."BillOfMaterials" USING btree ("organizationId");


--
-- Name: BillOfMaterials_organizationId_productId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "BillOfMaterials_organizationId_productId_idx" ON public."BillOfMaterials" USING btree ("organizationId", "productId");


--
-- Name: BillOfMaterials_organizationId_productId_version_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "BillOfMaterials_organizationId_productId_version_key" ON public."BillOfMaterials" USING btree ("organizationId", "productId", version);


--
-- Name: BoMItem_bomId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "BoMItem_bomId_idx" ON public."BoMItem" USING btree ("bomId");


--
-- Name: BoMItem_componentId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "BoMItem_componentId_idx" ON public."BoMItem" USING btree ("componentId");


--
-- Name: CashClosure_organizationId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "CashClosure_organizationId_idx" ON public."CashClosure" USING btree ("organizationId");


--
-- Name: CashClosure_status_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "CashClosure_status_idx" ON public."CashClosure" USING btree (status);


--
-- Name: CashClosure_userId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "CashClosure_userId_idx" ON public."CashClosure" USING btree ("userId");


--
-- Name: CashDrawerShift_organizationId_openingDate_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "CashDrawerShift_organizationId_openingDate_idx" ON public."CashDrawerShift" USING btree ("organizationId", "openingDate");


--
-- Name: CashDrawerShift_organizationId_status_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "CashDrawerShift_organizationId_status_idx" ON public."CashDrawerShift" USING btree ("organizationId", status);


--
-- Name: CashDrawerShift_organizationId_userId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "CashDrawerShift_organizationId_userId_idx" ON public."CashDrawerShift" USING btree ("organizationId", "userId");


--
-- Name: Category_organizationId_name_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "Category_organizationId_name_key" ON public."Category" USING btree ("organizationId", name);


--
-- Name: Check_bankAccountId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "Check_bankAccountId_idx" ON public."Check" USING btree ("bankAccountId");


--
-- Name: Check_bankAccountId_number_type_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "Check_bankAccountId_number_type_key" ON public."Check" USING btree ("bankAccountId", number, type);


--
-- Name: Check_dueDate_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "Check_dueDate_idx" ON public."Check" USING btree ("dueDate");


--
-- Name: Check_organizationId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "Check_organizationId_idx" ON public."Check" USING btree ("organizationId");


--
-- Name: Check_organizationId_status_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "Check_organizationId_status_idx" ON public."Check" USING btree ("organizationId", status);


--
-- Name: Check_organizationId_type_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "Check_organizationId_type_idx" ON public."Check" USING btree ("organizationId", type);


--
-- Name: ClientFiscalData_clientId_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "ClientFiscalData_clientId_key" ON public."ClientFiscalData" USING btree ("clientId");


--
-- Name: Client_organizationId_idNumber_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "Client_organizationId_idNumber_key" ON public."Client" USING btree ("organizationId", "idNumber");


--
-- Name: Client_organizationId_name_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "Client_organizationId_name_idx" ON public."Client" USING btree ("organizationId", name);


--
-- Name: CostCenter_organizationId_code_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "CostCenter_organizationId_code_key" ON public."CostCenter" USING btree ("organizationId", code);


--
-- Name: CostCenter_organizationId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "CostCenter_organizationId_idx" ON public."CostCenter" USING btree ("organizationId");


--
-- Name: EstimateItem_estimateId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "EstimateItem_estimateId_idx" ON public."EstimateItem" USING btree ("estimateId");


--
-- Name: Estimate_organizationId_date_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "Estimate_organizationId_date_idx" ON public."Estimate" USING btree ("organizationId", date);


--
-- Name: Estimate_organizationId_number_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "Estimate_organizationId_number_key" ON public."Estimate" USING btree ("organizationId", number);


--
-- Name: Estimate_organizationId_status_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "Estimate_organizationId_status_idx" ON public."Estimate" USING btree ("organizationId", status);


--
-- Name: ExchangeRateAdjustment_organizationId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "ExchangeRateAdjustment_organizationId_idx" ON public."ExchangeRateAdjustment" USING btree ("organizationId");


--
-- Name: ExchangeRateAdjustment_period_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "ExchangeRateAdjustment_period_idx" ON public."ExchangeRateAdjustment" USING btree (period);


--
-- Name: ExpenseItem_expenseId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "ExpenseItem_expenseId_idx" ON public."ExpenseItem" USING btree ("expenseId");


--
-- Name: Expense_journalEntryId_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "Expense_journalEntryId_key" ON public."Expense" USING btree ("journalEntryId");


--
-- Name: Expense_organizationId_costCenterId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "Expense_organizationId_costCenterId_idx" ON public."Expense" USING btree ("organizationId", "costCenterId");


--
-- Name: Expense_organizationId_date_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "Expense_organizationId_date_idx" ON public."Expense" USING btree ("organizationId", date);


--
-- Name: Expense_organizationId_number_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "Expense_organizationId_number_key" ON public."Expense" USING btree ("organizationId", number);


--
-- Name: Expense_organizationId_status_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "Expense_organizationId_status_idx" ON public."Expense" USING btree ("organizationId", status);


--
-- Name: Expense_organizationId_type_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "Expense_organizationId_type_idx" ON public."Expense" USING btree ("organizationId", type);


--
-- Name: FixedAsset_categoryId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "FixedAsset_categoryId_idx" ON public."FixedAsset" USING btree ("categoryId");


--
-- Name: FixedAsset_organizationId_code_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "FixedAsset_organizationId_code_key" ON public."FixedAsset" USING btree ("organizationId", code);


--
-- Name: FixedAsset_organizationId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "FixedAsset_organizationId_idx" ON public."FixedAsset" USING btree ("organizationId");


--
-- Name: Income_organizationId_costCenterId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "Income_organizationId_costCenterId_idx" ON public."Income" USING btree ("organizationId", "costCenterId");


--
-- Name: Income_organizationId_date_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "Income_organizationId_date_idx" ON public."Income" USING btree ("organizationId", date);


--
-- Name: Income_organizationId_number_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "Income_organizationId_number_key" ON public."Income" USING btree ("organizationId", number);


--
-- Name: Income_organizationId_status_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "Income_organizationId_status_idx" ON public."Income" USING btree ("organizationId", status);


--
-- Name: InventoryMovement_organizationId_createdAt_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "InventoryMovement_organizationId_createdAt_idx" ON public."InventoryMovement" USING btree ("organizationId", "createdAt");


--
-- Name: InventoryMovement_organizationId_productId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "InventoryMovement_organizationId_productId_idx" ON public."InventoryMovement" USING btree ("organizationId", "productId");


--
-- Name: InventoryMovement_organizationId_type_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "InventoryMovement_organizationId_type_idx" ON public."InventoryMovement" USING btree ("organizationId", type);


--
-- Name: InventoryWarehouse_productId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "InventoryWarehouse_productId_idx" ON public."InventoryWarehouse" USING btree ("productId");


--
-- Name: InventoryWarehouse_productId_warehouseId_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "InventoryWarehouse_productId_warehouseId_key" ON public."InventoryWarehouse" USING btree ("productId", "warehouseId");


--
-- Name: InventoryWarehouse_warehouseId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "InventoryWarehouse_warehouseId_idx" ON public."InventoryWarehouse" USING btree ("warehouseId");


--
-- Name: InvoiceItem_invoiceId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "InvoiceItem_invoiceId_idx" ON public."InvoiceItem" USING btree ("invoiceId");


--
-- Name: Invoice_journalEntryId_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "Invoice_journalEntryId_key" ON public."Invoice" USING btree ("journalEntryId");


--
-- Name: Invoice_organizationId_costCenterId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "Invoice_organizationId_costCenterId_idx" ON public."Invoice" USING btree ("organizationId", "costCenterId");


--
-- Name: Invoice_organizationId_date_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "Invoice_organizationId_date_idx" ON public."Invoice" USING btree ("organizationId", date);


--
-- Name: Invoice_organizationId_number_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "Invoice_organizationId_number_key" ON public."Invoice" USING btree ("organizationId", number);


--
-- Name: Invoice_organizationId_status_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "Invoice_organizationId_status_idx" ON public."Invoice" USING btree ("organizationId", status);


--
-- Name: JournalEntry_organizationId_date_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "JournalEntry_organizationId_date_idx" ON public."JournalEntry" USING btree ("organizationId", date);


--
-- Name: JournalEntry_organizationId_sourceType_sourceId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "JournalEntry_organizationId_sourceType_sourceId_idx" ON public."JournalEntry" USING btree ("organizationId", "sourceType", "sourceId");


--
-- Name: JournalEntry_organizationId_status_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "JournalEntry_organizationId_status_idx" ON public."JournalEntry" USING btree ("organizationId", status);


--
-- Name: JournalLine_accountId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "JournalLine_accountId_idx" ON public."JournalLine" USING btree ("accountId");


--
-- Name: JournalLine_entryId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "JournalLine_entryId_idx" ON public."JournalLine" USING btree ("entryId");


--
-- Name: Membership_userId_organizationId_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "Membership_userId_organizationId_key" ON public."Membership" USING btree ("userId", "organizationId");


--
-- Name: Notification_createdAt_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "Notification_createdAt_idx" ON public."Notification" USING btree ("createdAt" DESC);


--
-- Name: Notification_isRead_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "Notification_isRead_idx" ON public."Notification" USING btree ("isRead");


--
-- Name: Notification_organizationId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "Notification_organizationId_idx" ON public."Notification" USING btree ("organizationId");


--
-- Name: Notification_userId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "Notification_userId_idx" ON public."Notification" USING btree ("userId");


--
-- Name: Organization_slug_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "Organization_slug_key" ON public."Organization" USING btree (slug);


--
-- Name: POSConfig_organizationId_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "POSConfig_organizationId_key" ON public."POSConfig" USING btree ("organizationId");


--
-- Name: Payment_shiftId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "Payment_shiftId_idx" ON public."Payment" USING btree ("shiftId");


--
-- Name: ProductAlert_isActive_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "ProductAlert_isActive_idx" ON public."ProductAlert" USING btree ("isActive");


--
-- Name: ProductAlert_productId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "ProductAlert_productId_idx" ON public."ProductAlert" USING btree ("productId");


--
-- Name: ProductAlert_warehouseId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "ProductAlert_warehouseId_idx" ON public."ProductAlert" USING btree ("warehouseId");


--
-- Name: ProductAttributeValue_productId_attributeId_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "ProductAttributeValue_productId_attributeId_key" ON public."ProductAttributeValue" USING btree ("productId", "attributeId");


--
-- Name: ProductAttributeValue_productId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "ProductAttributeValue_productId_idx" ON public."ProductAttributeValue" USING btree ("productId");


--
-- Name: ProductAttribute_organizationId_code_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "ProductAttribute_organizationId_code_key" ON public."ProductAttribute" USING btree ("organizationId", code);


--
-- Name: ProductAttribute_organizationId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "ProductAttribute_organizationId_idx" ON public."ProductAttribute" USING btree ("organizationId");


--
-- Name: Product_organizationId_name_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "Product_organizationId_name_idx" ON public."Product" USING btree ("organizationId", name);


--
-- Name: Product_organizationId_sku_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "Product_organizationId_sku_key" ON public."Product" USING btree ("organizationId", sku);


--
-- Name: ProductionConsumption_productionOrderId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "ProductionConsumption_productionOrderId_idx" ON public."ProductionConsumption" USING btree ("productionOrderId");


--
-- Name: ProductionOrder_organizationId_number_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "ProductionOrder_organizationId_number_key" ON public."ProductionOrder" USING btree ("organizationId", number);


--
-- Name: ProductionOrder_organizationId_productId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "ProductionOrder_organizationId_productId_idx" ON public."ProductionOrder" USING btree ("organizationId", "productId");


--
-- Name: ProductionOrder_organizationId_status_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "ProductionOrder_organizationId_status_idx" ON public."ProductionOrder" USING btree ("organizationId", status);


--
-- Name: ReconciliationItem_reconciliationId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "ReconciliationItem_reconciliationId_idx" ON public."ReconciliationItem" USING btree ("reconciliationId");


--
-- Name: ReconciliationItem_transactionId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "ReconciliationItem_transactionId_idx" ON public."ReconciliationItem" USING btree ("transactionId");


--
-- Name: RetentionCertificate_date_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "RetentionCertificate_date_idx" ON public."RetentionCertificate" USING btree (date);


--
-- Name: RetentionCertificate_organizationId_certificateNumber_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "RetentionCertificate_organizationId_certificateNumber_key" ON public."RetentionCertificate" USING btree ("organizationId", "certificateNumber");


--
-- Name: RetentionCertificate_organizationId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "RetentionCertificate_organizationId_idx" ON public."RetentionCertificate" USING btree ("organizationId");


--
-- Name: RetentionCertificate_retentionId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "RetentionCertificate_retentionId_idx" ON public."RetentionCertificate" USING btree ("retentionId");


--
-- Name: Retention_organizationId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "Retention_organizationId_idx" ON public."Retention" USING btree ("organizationId");


--
-- Name: Retention_organizationId_name_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "Retention_organizationId_name_key" ON public."Retention" USING btree ("organizationId", name);


--
-- Name: Role_name_organizationId_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "Role_name_organizationId_key" ON public."Role" USING btree (name, "organizationId");


--
-- Name: Session_sessionToken_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "Session_sessionToken_key" ON public."Session" USING btree ("sessionToken");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: Vehicle_organizationId_clientId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "Vehicle_organizationId_clientId_idx" ON public."Vehicle" USING btree ("organizationId", "clientId");


--
-- Name: Vehicle_organizationId_plates_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "Vehicle_organizationId_plates_idx" ON public."Vehicle" USING btree ("organizationId", plates);


--
-- Name: VerificationToken_identifier_token_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON public."VerificationToken" USING btree (identifier, token);


--
-- Name: VerificationToken_token_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "VerificationToken_token_key" ON public."VerificationToken" USING btree (token);


--
-- Name: Warehouse_organizationId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "Warehouse_organizationId_idx" ON public."Warehouse" USING btree ("organizationId");


--
-- Name: Warehouse_organizationId_name_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "Warehouse_organizationId_name_key" ON public."Warehouse" USING btree ("organizationId", name);


--
-- Name: WorkOrderAssignment_userId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "WorkOrderAssignment_userId_idx" ON public."WorkOrderAssignment" USING btree ("userId");


--
-- Name: WorkOrderAssignment_workOrderId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "WorkOrderAssignment_workOrderId_idx" ON public."WorkOrderAssignment" USING btree ("workOrderId");


--
-- Name: WorkOrder_mechanicId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "WorkOrder_mechanicId_idx" ON public."WorkOrder" USING btree ("mechanicId");


--
-- Name: WorkOrder_organizationId_clientId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "WorkOrder_organizationId_clientId_idx" ON public."WorkOrder" USING btree ("organizationId", "clientId");


--
-- Name: WorkOrder_organizationId_number_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "WorkOrder_organizationId_number_key" ON public."WorkOrder" USING btree ("organizationId", number);


--
-- Name: WorkOrder_organizationId_status_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "WorkOrder_organizationId_status_idx" ON public."WorkOrder" USING btree ("organizationId", status);


--
-- Name: WorkOrder_organizationId_vehicleId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "WorkOrder_organizationId_vehicleId_idx" ON public."WorkOrder" USING btree ("organizationId", "vehicleId");


--
-- Name: Account Account_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: AccountingAccount AccountingAccount_organizationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."AccountingAccount"
    ADD CONSTRAINT "AccountingAccount_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES public."Organization"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: AccountingAccount AccountingAccount_parentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."AccountingAccount"
    ADD CONSTRAINT "AccountingAccount_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES public."AccountingAccount"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ActivityLog ActivityLog_organizationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."ActivityLog"
    ADD CONSTRAINT "ActivityLog_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES public."Organization"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ActivityLog ActivityLog_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."ActivityLog"
    ADD CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: AssetCategory AssetCategory_organizationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."AssetCategory"
    ADD CONSTRAINT "AssetCategory_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES public."Organization"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: AssetDepreciation AssetDepreciation_assetId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."AssetDepreciation"
    ADD CONSTRAINT "AssetDepreciation_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES public."FixedAsset"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: AssetDepreciation AssetDepreciation_organizationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."AssetDepreciation"
    ADD CONSTRAINT "AssetDepreciation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES public."Organization"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: BankAccount BankAccount_organizationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."BankAccount"
    ADD CONSTRAINT "BankAccount_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES public."Organization"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: BankReconciliation BankReconciliation_bankAccountId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."BankReconciliation"
    ADD CONSTRAINT "BankReconciliation_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES public."BankAccount"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: BankReconciliation BankReconciliation_organizationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."BankReconciliation"
    ADD CONSTRAINT "BankReconciliation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES public."Organization"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: BillOfMaterials BillOfMaterials_organizationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."BillOfMaterials"
    ADD CONSTRAINT "BillOfMaterials_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES public."Organization"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: BillOfMaterials BillOfMaterials_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."BillOfMaterials"
    ADD CONSTRAINT "BillOfMaterials_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: BoMItem BoMItem_bomId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."BoMItem"
    ADD CONSTRAINT "BoMItem_bomId_fkey" FOREIGN KEY ("bomId") REFERENCES public."BillOfMaterials"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: BoMItem BoMItem_componentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."BoMItem"
    ADD CONSTRAINT "BoMItem_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CashClosure CashClosure_organizationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."CashClosure"
    ADD CONSTRAINT "CashClosure_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES public."Organization"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CashClosure CashClosure_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."CashClosure"
    ADD CONSTRAINT "CashClosure_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: CashDrawerShift CashDrawerShift_organizationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."CashDrawerShift"
    ADD CONSTRAINT "CashDrawerShift_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES public."Organization"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CashDrawerShift CashDrawerShift_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."CashDrawerShift"
    ADD CONSTRAINT "CashDrawerShift_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Category Category_organizationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES public."Organization"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Check Check_bankAccountId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Check"
    ADD CONSTRAINT "Check_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES public."BankAccount"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Check Check_organizationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Check"
    ADD CONSTRAINT "Check_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES public."Organization"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ClientFiscalData ClientFiscalData_clientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."ClientFiscalData"
    ADD CONSTRAINT "ClientFiscalData_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES public."Client"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Client Client_organizationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Client"
    ADD CONSTRAINT "Client_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES public."Organization"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CostCenter CostCenter_organizationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."CostCenter"
    ADD CONSTRAINT "CostCenter_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES public."Organization"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: EstimateItem EstimateItem_estimateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."EstimateItem"
    ADD CONSTRAINT "EstimateItem_estimateId_fkey" FOREIGN KEY ("estimateId") REFERENCES public."Estimate"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: EstimateItem EstimateItem_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."EstimateItem"
    ADD CONSTRAINT "EstimateItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Estimate Estimate_clientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Estimate"
    ADD CONSTRAINT "Estimate_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES public."Client"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Estimate Estimate_organizationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Estimate"
    ADD CONSTRAINT "Estimate_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES public."Organization"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ExchangeRateAdjustment ExchangeRateAdjustment_organizationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."ExchangeRateAdjustment"
    ADD CONSTRAINT "ExchangeRateAdjustment_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES public."Organization"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ExpenseItem ExpenseItem_expenseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."ExpenseItem"
    ADD CONSTRAINT "ExpenseItem_expenseId_fkey" FOREIGN KEY ("expenseId") REFERENCES public."Expense"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ExpenseItem ExpenseItem_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."ExpenseItem"
    ADD CONSTRAINT "ExpenseItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Expense Expense_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Expense"
    ADD CONSTRAINT "Expense_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Expense Expense_costCenterId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Expense"
    ADD CONSTRAINT "Expense_costCenterId_fkey" FOREIGN KEY ("costCenterId") REFERENCES public."CostCenter"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Expense Expense_journalEntryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Expense"
    ADD CONSTRAINT "Expense_journalEntryId_fkey" FOREIGN KEY ("journalEntryId") REFERENCES public."JournalEntry"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Expense Expense_organizationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Expense"
    ADD CONSTRAINT "Expense_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES public."Organization"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: FixedAsset FixedAsset_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."FixedAsset"
    ADD CONSTRAINT "FixedAsset_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."AssetCategory"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: FixedAsset FixedAsset_organizationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."FixedAsset"
    ADD CONSTRAINT "FixedAsset_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES public."Organization"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Income Income_bankAccountId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Income"
    ADD CONSTRAINT "Income_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES public."BankAccount"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Income Income_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Income"
    ADD CONSTRAINT "Income_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Income Income_clientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Income"
    ADD CONSTRAINT "Income_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES public."Client"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Income Income_costCenterId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Income"
    ADD CONSTRAINT "Income_costCenterId_fkey" FOREIGN KEY ("costCenterId") REFERENCES public."CostCenter"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Income Income_organizationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Income"
    ADD CONSTRAINT "Income_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES public."Organization"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: InventoryMovement InventoryMovement_organizationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."InventoryMovement"
    ADD CONSTRAINT "InventoryMovement_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES public."Organization"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: InventoryMovement InventoryMovement_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."InventoryMovement"
    ADD CONSTRAINT "InventoryMovement_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: InventoryWarehouse InventoryWarehouse_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."InventoryWarehouse"
    ADD CONSTRAINT "InventoryWarehouse_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: InventoryWarehouse InventoryWarehouse_warehouseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."InventoryWarehouse"
    ADD CONSTRAINT "InventoryWarehouse_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES public."Warehouse"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: InvoiceItem InvoiceItem_invoiceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."InvoiceItem"
    ADD CONSTRAINT "InvoiceItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES public."Invoice"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: InvoiceItem InvoiceItem_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."InvoiceItem"
    ADD CONSTRAINT "InvoiceItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Invoice Invoice_clientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Invoice"
    ADD CONSTRAINT "Invoice_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES public."Client"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Invoice Invoice_costCenterId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Invoice"
    ADD CONSTRAINT "Invoice_costCenterId_fkey" FOREIGN KEY ("costCenterId") REFERENCES public."CostCenter"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Invoice Invoice_journalEntryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Invoice"
    ADD CONSTRAINT "Invoice_journalEntryId_fkey" FOREIGN KEY ("journalEntryId") REFERENCES public."JournalEntry"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Invoice Invoice_organizationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Invoice"
    ADD CONSTRAINT "Invoice_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES public."Organization"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: JournalEntry JournalEntry_organizationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."JournalEntry"
    ADD CONSTRAINT "JournalEntry_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES public."Organization"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: JournalLine JournalLine_accountId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."JournalLine"
    ADD CONSTRAINT "JournalLine_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES public."AccountingAccount"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: JournalLine JournalLine_entryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."JournalLine"
    ADD CONSTRAINT "JournalLine_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES public."JournalEntry"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Membership Membership_organizationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Membership"
    ADD CONSTRAINT "Membership_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES public."Organization"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Membership Membership_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Membership"
    ADD CONSTRAINT "Membership_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public."Role"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Membership Membership_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Membership"
    ADD CONSTRAINT "Membership_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Notification Notification_organizationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES public."Organization"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Notification Notification_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: POSConfig POSConfig_defaultClientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."POSConfig"
    ADD CONSTRAINT "POSConfig_defaultClientId_fkey" FOREIGN KEY ("defaultClientId") REFERENCES public."Client"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: POSConfig POSConfig_organizationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."POSConfig"
    ADD CONSTRAINT "POSConfig_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES public."Organization"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Payment Payment_expenseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_expenseId_fkey" FOREIGN KEY ("expenseId") REFERENCES public."Expense"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Payment Payment_invoiceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES public."Invoice"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Payment Payment_shiftId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES public."CashDrawerShift"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ProductAlert ProductAlert_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."ProductAlert"
    ADD CONSTRAINT "ProductAlert_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProductAttributeValue ProductAttributeValue_attributeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."ProductAttributeValue"
    ADD CONSTRAINT "ProductAttributeValue_attributeId_fkey" FOREIGN KEY ("attributeId") REFERENCES public."ProductAttribute"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProductAttributeValue ProductAttributeValue_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."ProductAttributeValue"
    ADD CONSTRAINT "ProductAttributeValue_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProductAttribute ProductAttribute_organizationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."ProductAttribute"
    ADD CONSTRAINT "ProductAttribute_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES public."Organization"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Product Product_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Product Product_organizationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES public."Organization"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProductionConsumption ProductionConsumption_componentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."ProductionConsumption"
    ADD CONSTRAINT "ProductionConsumption_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProductionConsumption ProductionConsumption_productionOrderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."ProductionConsumption"
    ADD CONSTRAINT "ProductionConsumption_productionOrderId_fkey" FOREIGN KEY ("productionOrderId") REFERENCES public."ProductionOrder"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProductionOrder ProductionOrder_organizationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."ProductionOrder"
    ADD CONSTRAINT "ProductionOrder_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES public."Organization"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProductionOrder ProductionOrder_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."ProductionOrder"
    ADD CONSTRAINT "ProductionOrder_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ReconciliationItem ReconciliationItem_reconciliationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."ReconciliationItem"
    ADD CONSTRAINT "ReconciliationItem_reconciliationId_fkey" FOREIGN KEY ("reconciliationId") REFERENCES public."BankReconciliation"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: RetentionCertificate RetentionCertificate_organizationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."RetentionCertificate"
    ADD CONSTRAINT "RetentionCertificate_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES public."Organization"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: RetentionCertificate RetentionCertificate_retentionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."RetentionCertificate"
    ADD CONSTRAINT "RetentionCertificate_retentionId_fkey" FOREIGN KEY ("retentionId") REFERENCES public."Retention"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Retention Retention_organizationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Retention"
    ADD CONSTRAINT "Retention_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES public."Organization"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Role Role_organizationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Role"
    ADD CONSTRAINT "Role_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES public."Organization"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Session Session_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Vehicle Vehicle_clientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Vehicle"
    ADD CONSTRAINT "Vehicle_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES public."Client"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Vehicle Vehicle_organizationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Vehicle"
    ADD CONSTRAINT "Vehicle_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES public."Organization"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Warehouse Warehouse_organizationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Warehouse"
    ADD CONSTRAINT "Warehouse_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES public."Organization"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: WorkOrderAssignment WorkOrderAssignment_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."WorkOrderAssignment"
    ADD CONSTRAINT "WorkOrderAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: WorkOrderAssignment WorkOrderAssignment_workOrderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."WorkOrderAssignment"
    ADD CONSTRAINT "WorkOrderAssignment_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES public."WorkOrder"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: WorkOrder WorkOrder_clientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."WorkOrder"
    ADD CONSTRAINT "WorkOrder_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES public."Client"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: WorkOrder WorkOrder_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."WorkOrder"
    ADD CONSTRAINT "WorkOrder_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: WorkOrder WorkOrder_invoiceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."WorkOrder"
    ADD CONSTRAINT "WorkOrder_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES public."Invoice"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: WorkOrder WorkOrder_mechanicId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."WorkOrder"
    ADD CONSTRAINT "WorkOrder_mechanicId_fkey" FOREIGN KEY ("mechanicId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: WorkOrder WorkOrder_organizationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."WorkOrder"
    ADD CONSTRAINT "WorkOrder_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES public."Organization"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: WorkOrder WorkOrder_vehicleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."WorkOrder"
    ADD CONSTRAINT "WorkOrder_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES public."Vehicle"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

\unrestrict Ofa69C4W3HRe7xKUpEfjLqhY4HfZnI8ApLxjHn1kbRXMMXKwiXwLLKpAE8tGoEu

