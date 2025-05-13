import React, { useState, useEffect } from 'react';
import { FundingSource, CreateFundingSourceData, UpdateFundingSourceData, FundingSourceDetails, BankAccountDetails, CryptoWalletDetails, CashDetails, DigitalPaymentDetails } from '../../types/fundingSource.types';
import { Button, Input, Notification } from '../common'; // Asumiendo que estos componentes comunes existen

interface FundingSourceFormProps {
  initialData?: FundingSource | null;
  onSubmit: (data: CreateFundingSourceData | UpdateFundingSourceData) => Promise<void>;
  isSubmitting: boolean;
  errorMessage?: string | null;
  onCancel?: () => void;
}

const fundingSourceTypes = [
  { value: 'bank_account', label: 'Cuenta Bancaria' },
  { value: 'crypto_wallet', label: 'Billetera Crypto' },
  { value: 'cash', label: 'Efectivo' },
  { value: 'paypal', label: 'PayPal' },
  { value: 'zelle', label: 'Zelle' },
  { value: 'other', label: 'Otro' },
];

const FundingSourceForm: React.FC<FundingSourceFormProps> = ({
  initialData,
  onSubmit,
  isSubmitting,
  errorMessage,
  onCancel
}) => {
  const [name, setName] = useState(initialData?.name || '');
  const [type, setType] = useState<FundingSource['type']>(initialData?.type || 'bank_account');
  const [currency, setCurrency] = useState(initialData?.currency || '');
  const [initialBalance, setInitialBalance] = useState(initialData?.currentBalance || 0);
  const [status, setStatus] = useState<FundingSource['status']>(initialData?.status || 'active');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [typeSpecificDetails, setTypeSpecificDetails] = useState<FundingSourceDetails | undefined>(initialData?.typeSpecificDetails || undefined);
  const [internalErrorMessage, setInternalErrorMessage] = useState<string | null>(errorMessage || null); // Estado interno para controlar el mensaje de error

  const isEditing = !!initialData;

  // Sincronizar el estado interno con la prop errorMessage
  useEffect(() => {
    setInternalErrorMessage(errorMessage || null);
  }, [errorMessage]);

  // Efecto para resetear detalles específicos cuando cambia el tipo
  useEffect(() => {
    if (!isEditing) { // Solo resetear al crear si cambia el tipo
        setTypeSpecificDetails(undefined);
    }
    // Si estamos editando, podríamos querer mantener los datos si el tipo vuelve a ser el original,
    // pero por simplicidad, vamos a resetearlos también al editar.
    // Podríamos hacer una lógica más compleja si fuera necesario.
    setTypeSpecificDetails(undefined);
  }, [type, isEditing]);

  const handleDetailsChange = (field: string, value: any) => {
    setTypeSpecificDetails(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setInternalErrorMessage(null); // Limpiar error interno al intentar enviar
    const commonData = {
      name,
      currency: currency.toUpperCase(),
      type,
      status,
      notes,
      typeSpecificDetails: typeSpecificDetails || {},
    };

    let submitData: CreateFundingSourceData | UpdateFundingSourceData;

    if (isEditing) {
        submitData = {
            ...commonData,
            // No incluimos currentBalance en la actualización general
        } as UpdateFundingSourceData;
    } else {
        submitData = {
            ...commonData,
            currentBalance: Number(initialBalance) || 0,
        } as CreateFundingSourceData;
    }

    onSubmit(submitData);
  };

  const renderTypeSpecificFields = () => {
    switch (type) {
      case 'bank_account':
        const bankDetails = typeSpecificDetails as BankAccountDetails | undefined;
        return (
          <>
            <Input label="Nombre del Banco" value={bankDetails?.bankName || ''} onChange={(e) => handleDetailsChange('bankName', e.target.value)} required />
            <Input label="Número de Cuenta" value={bankDetails?.accountNumber || ''} onChange={(e) => handleDetailsChange('accountNumber', e.target.value)} required />
            {/* Añadir más campos opcionales de banco aquí si se necesitan: accountType, accountHolder, routingNumber, swiftCode, iban, etc. */}
          </>
        );
      case 'crypto_wallet':
        const cryptoDetails = typeSpecificDetails as CryptoWalletDetails | undefined;
        return (
          <>
            <Input label="Dirección de Wallet" value={cryptoDetails?.walletAddress || ''} onChange={(e) => handleDetailsChange('walletAddress', e.target.value)} required />
            <Input label="Red (Opcional)" value={cryptoDetails?.network || ''} onChange={(e) => handleDetailsChange('network', e.target.value)} placeholder="Ej. ERC20, TRC20, BEP20"/>
            {/* Añadir más campos opcionales de crypto: exchange, memo, etc. */}
          </>
        );
        case 'paypal':
        case 'zelle':
            const digitalDetails = typeSpecificDetails as DigitalPaymentDetails | undefined;
            return (
                <>
                 <Input type="email" label="Email Asociado" value={digitalDetails?.email || ''} onChange={(e) => handleDetailsChange('email', e.target.value)} required />
                 {/* Añadir más campos opcionales: accountHolder, country, etc. */}
                </>
            );
      case 'cash':
        const cashDetails = typeSpecificDetails as CashDetails | undefined;
         return (
                <>
                 <Input label="Ubicación (Opcional)" value={cashDetails?.location || ''} onChange={(e) => handleDetailsChange('location', e.target.value)} placeholder="Ej. Oficina, Caja Fuerte"/>
                 <Input label="Custodio (Opcional)" value={cashDetails?.custodian || ''} onChange={(e) => handleDetailsChange('custodian', e.target.value)} placeholder="Ej. Nombre del responsable"/>
                </>
         );
      case 'other':
         // No requiere campos específicos obligatorios por defecto
         return <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">No se requieren detalles específicos para el tipo 'Otro'. Puede agregar notas generales.</p>;
      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {internalErrorMessage && <Notification type="error" message={internalErrorMessage} onClose={() => setInternalErrorMessage(null)} />}
      
      <Input 
        label="Nombre Descriptivo" 
        value={name} 
        onChange={(e) => setName(e.target.value)} 
        required 
        placeholder="Ej. Binance USDT, Banco Mercantil VES"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col space-y-1">
           <label htmlFor="funding-source-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipo de Fuente</label>
           <select 
             id="funding-source-type"
             value={type} 
             onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setType(e.target.value as FundingSource['type'])} 
             required 
             className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-white"
           >
             {fundingSourceTypes.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
             ))}
           </select>
        </div>
        <Input 
          label="Moneda (Código)" 
          value={currency} 
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrency(e.target.value)} 
          required 
          placeholder="Ej. USD, USDT, VES, COP"
          maxLength={10} // Limitar longitud
        />
      </div>

      {!isEditing && (
        <Input 
          label="Saldo Inicial (Opcional)" 
          type="number" 
          value={initialBalance}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInitialBalance(parseFloat(e.target.value) || 0)} 
          min={0}
          step="0.01"
        />
      )}
      
      {/* Renderizar campos específicos del tipo */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Detalles Específicos ({fundingSourceTypes.find(t => t.value === type)?.label})</h3>
          <div className="space-y-4">
             {renderTypeSpecificFields()}
          </div>
      </div>

      {isEditing && (
         <div className="flex flex-col space-y-1">
            <label htmlFor="funding-source-status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Estado</label>
            <select 
              id="funding-source-status"
              value={status} 
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatus(e.target.value as FundingSource['status'])} 
              required 
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-white"
            >
              <option value="active">Activa</option>
              <option value="inactive">Inactiva</option>
              <option value="archived">Archivada</option>
            </select>
         </div>
      )}

      <div className="flex flex-col space-y-1">
        <label htmlFor="funding-source-notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notas (Opcional)</label>
        <textarea 
          id="funding-source-notes"
          value={notes} 
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)} 
          rows={3} 
          className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-white"
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
            Cancelar
          </Button>
        )}
        <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting}>
          {isEditing ? 'Actualizar Fuente' : 'Crear Fuente'}
        </Button>
      </div>
    </form>
  );
};

export default FundingSourceForm; 