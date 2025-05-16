import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout';
import { Button, Input, Notification } from '../../components/common';
import { useAuth } from '../../contexts/AuthContext';
import fundingSourceService from '../../services/fundingSource.service';
import transactionService from '../../services/transaction.service';
import gameService from '../../services/game.service';
import contactService from '../../services/contact.service';
import { FundingSource } from '../../types/fundingSource.types';
import { GameItem } from '../../types/game.types';
import { Contact } from '../../types/contact.types';
import { CreateTransactionData, TransactionType, CapitalDeclarationEntry, TransactionItemDetail, TransactionPaymentDetail } from '../../types/transaction.types';
import { toast } from 'react-toastify';
import Pathnames from '../../router/pathnames';

// Definir los tipos de transacción disponibles para el usuario
const AVAILABLE_TRANSACTION_TYPES: { value: TransactionType; label: string }[] = [
  { value: 'DECLARACION_OPERADOR_INICIO_DIA', label: 'Declaración de Inicio de Día' },
  { value: 'COMPRA_ITEM_JUEGO', label: 'Compra de Ítem de Juego' },
  { value: 'VENTA_ITEM_JUEGO', label: 'Venta de Ítem de Juego' },
  // TODO: Añadir otros tipos de transacción aquí a medida que se implementen
  // { value: 'GASTO_OPERATIVO', label: 'Gasto Operativo' },
  // { value: 'TRANSFERENCIA_ENTRE_FUENTES', label: 'Transferencia entre Fuentes' },
];

const NewTransactionPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Estados del formulario GENÉRICOS
  const [transactionType, setTransactionType] = useState<TransactionType | ''>(AVAILABLE_TRANSACTION_TYPES[0].value);
  const [transactionDate, setTransactionDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState<string>('');
  const [contactId, setContactId] = useState<string>('');

  // Estados para DECLARACION_OPERADOR_INICIO_DIA
  const [declaracionFundingSourceId, setDeclaracionFundingSourceId] = useState<string>('');
  const [declaredBalance, setDeclaredBalance] = useState<string>('');
  
  // Estados para COMPRA/VENTA_ITEM_JUEGO (itemDetails)
  const [gameItemId, setGameItemId] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [unitPriceAmount, setUnitPriceAmount] = useState<string>('');
  const [unitPriceCurrency, setUnitPriceCurrency] = useState<string>('USD');

  // Estados para COMPRA/VENTA_ITEM_JUEGO (paymentDetails)
  const [paymentFundingSourceId, setPaymentFundingSourceId] = useState<string>('');
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentCurrency, setPaymentCurrency] = useState<string>('USD');
  
  // Estados para datos de UI y carga
  const [fundingSources, setFundingSources] = useState<FundingSource[]>([]);
  const [gameItems, setGameItems] = useState<GameItem[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedDeclaracionFS, setSelectedDeclaracionFS] = useState<FundingSource | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingInitialData, setIsFetchingInitialData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const commonSelectClassName = "mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-white";

  // Cargar datos iniciales (Fuentes de fondos, GameItems, Contactos)
  const fetchInitialData = useCallback(async () => {
    setIsFetchingInitialData(true);
    try {
      const [sourcesData, itemsData, contactsData] = await Promise.all([
        fundingSourceService.getActiveFundingSources(),
        gameService.getGameItems({ status: 'active' }),
        contactService.getAllContacts({ limit: 500 })
      ]);
      setFundingSources(sourcesData);
      setGameItems(itemsData);
      setContacts(contactsData.data);

      setDeclaracionFundingSourceId('');
      setDeclaredBalance('');
      setGameItemId('');
      setQuantity('');
      setUnitPriceAmount('');
      setPaymentFundingSourceId('');
      setPaymentAmount('');
      setContactId('');

      if (transactionType === 'DECLARACION_OPERADOR_INICIO_DIA' && sourcesData.length > 0) {
        // Opcional: setDeclaracionFundingSourceId(sourcesData[0]._id!);
      } else if ((transactionType === 'COMPRA_ITEM_JUEGO' || transactionType === 'VENTA_ITEM_JUEGO')) {
        if (itemsData.length > 0) {
          // Opcional: setGameItemId(itemsData[0]._id!);
        }
        if (sourcesData.length > 0) {
          // Opcional: setPaymentFundingSourceId(sourcesData[0]._id!);
        }
      }

    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al cargar datos iniciales.');
      setError('No se pudieron cargar los datos necesarios para el formulario.');
    }
    setIsFetchingInitialData(false);
  }, [transactionType]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Efecto para actualizar la moneda cuando cambia la fuente seleccionada para DECLARACIÓN
  useEffect(() => {
    if (declaracionFundingSourceId) {
      const source = fundingSources.find(s => s._id === declaracionFundingSourceId);
      setSelectedDeclaracionFS(source || null);
      if (source) setDeclaredBalance('');
    } else {
      setSelectedDeclaracionFS(null);
    }
  }, [declaracionFundingSourceId, fundingSources]);
  
  // Efecto para actualizar la moneda del pago cuando cambia la fuente de PAGO
  useEffect(() => {
    if (paymentFundingSourceId) {
      const source = fundingSources.find(s => s._id === paymentFundingSourceId);
      if (source) {
        setPaymentCurrency(source.currency);
      }
    } else {
      // Opcional: resetear moneda si no hay fuente de pago seleccionada
      // setPaymentCurrency('USD'); 
    }
  }, [paymentFundingSourceId, fundingSources]);

  // Calcular automáticamente el monto del pago para compras/ventas
  useEffect(() => {
    if (transactionType === 'COMPRA_ITEM_JUEGO' || transactionType === 'VENTA_ITEM_JUEGO') {
      const q = parseFloat(quantity);
      const p = parseFloat(unitPriceAmount);
      if (!isNaN(q) && !isNaN(p) && q > 0 && p > 0) {
        setPaymentAmount((q * p).toFixed(2));
      } else {
        setPaymentAmount('');
      }
    }
  }, [quantity, unitPriceAmount, transactionType]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!user) {
      toast.error('Usuario no autenticado.');
      setIsLoading(false);
      return;
    }
    if (!transactionType) {
      toast.error('Por favor, selecciona un tipo de transacción.');
      setIsLoading(false);
      return;
    }

    let transactionDataPayload: CreateTransactionData;

    try {
      // Construir payload según el tipo de transacción
      if (transactionType === 'DECLARACION_OPERADOR_INICIO_DIA') {
        if (!declaracionFundingSourceId || declaredBalance === '' || isNaN(parseFloat(declaredBalance))) {
          throw new Error('Para la declaración, selecciona una fuente y un saldo válido.');
        }
        const selectedFS = fundingSources.find(fs => fs._id === declaracionFundingSourceId);
        if (!selectedFS) throw new Error('Fuente de fondos para declaración no encontrada.');

        const capitalDeclaration: CapitalDeclarationEntry[] = [
          {
            fundingSourceId: selectedFS._id!,
            declaredBalance: parseFloat(declaredBalance),
            currency: selectedFS.currency,
          },
        ];
        transactionDataPayload = {
          type: transactionType,
          transactionDate: new Date(transactionDate),
          capitalDeclaration: capitalDeclaration,
          notes: notes.trim() || undefined,
          status: 'completed',
        };
      } else if (transactionType === 'COMPRA_ITEM_JUEGO' || transactionType === 'VENTA_ITEM_JUEGO') {
        if (!gameItemId || !paymentFundingSourceId || quantity === '' || unitPriceAmount === '' || paymentAmount === '') {
          throw new Error('Completa todos los campos para la compra/venta del ítem.');
        }
        const selectedGameItem = gameItems.find(i => i._id === gameItemId);
        if (!selectedGameItem) throw new Error('Ítem de juego no encontrado.');
        
        const selectedPaymentFS = fundingSources.find(fs => fs._id === paymentFundingSourceId);
        if (!selectedPaymentFS) throw new Error('Fuente de fondos para pago no encontrada.');

        const numQuantity = parseFloat(quantity);
        const numUnitPrice = parseFloat(unitPriceAmount);
        const numPaymentAmount = parseFloat(paymentAmount);

        if (isNaN(numQuantity) || numQuantity <= 0 || isNaN(numUnitPrice) || numUnitPrice < 0 || isNaN(numPaymentAmount) || numPaymentAmount <=0 ) {
            throw new Error('Valores numéricos inválidos para cantidad, precio o monto de pago.');
        }
        
        const itemDetails: TransactionItemDetail = {
          itemType: 'GameItem',
          itemId: gameItemId,
          itemNameSnapshot: selectedGameItem.name,
          quantity: numQuantity,
          unitPrice: { amount: numUnitPrice, currency: unitPriceCurrency.toUpperCase() },
          totalAmount: { amount: numQuantity * numUnitPrice, currency: unitPriceCurrency.toUpperCase() },
        };

        const paymentDetails: TransactionPaymentDetail = {
          fundingSourceId: paymentFundingSourceId,
          amount: numPaymentAmount,
          currency: selectedPaymentFS.currency.toUpperCase(),
        };

        transactionDataPayload = {
          type: transactionType,
          transactionDate: new Date(transactionDate),
          itemDetails,
          paymentDetails,
          contactId: contactId || undefined,
          notes: notes.trim() || undefined,
          status: 'completed',
        };

      } else {
        throw new Error('Tipo de transacción no soportado para creación desde esta interfaz.');
      }

      await transactionService.createTransaction(transactionDataPayload);
      toast.success(`Transacción (${AVAILABLE_TRANSACTION_TYPES.find(t => t.value === transactionType)?.label || transactionType}) creada con éxito.`);
      navigate(Pathnames.transactions.history); 

    } catch (err: any) {
      console.error('Error creating transaction:', err);
      const apiError = err.response?.data?.message || err.message || 'Error al crear la transacción.';
      setError(apiError);
      toast.error(apiError);
    } finally {
      setIsLoading(false);
    }
  };

  const pageTitle = AVAILABLE_TRANSACTION_TYPES.find(t => t.value === transactionType)?.label || 'Nueva Transacción';
  const submitButtonText = transactionType === 'DECLARACION_OPERADOR_INICIO_DIA' 
    ? 'Crear Declaración' 
    : transactionType === 'COMPRA_ITEM_JUEGO' 
    ? 'Registrar Compra' 
    : transactionType === 'VENTA_ITEM_JUEGO'
    ? 'Registrar Venta'
    : 'Crear Transacción';

  if (isFetchingInitialData) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-6 text-center">
          <p>Cargando datos del formulario...</p>
        </div>
      </DashboardLayout>
    );
  }

  const renderDeclaracionFields = () => (
    <>
      <div>
        <label htmlFor="declaracionFundingSourceId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Fuente de Fondos para Declaración
        </label>
        <select
          id="declaracionFundingSourceId"
          name="declaracionFundingSourceId"
          value={declaracionFundingSourceId}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setDeclaracionFundingSourceId(e.target.value)}
          required={transactionType === 'DECLARACION_OPERADOR_INICIO_DIA'}
          className={commonSelectClassName}
        >
          <option value="" disabled>Selecciona una fuente...</option>
          {fundingSources.map(source => (
            <option key={source._id} value={source._id!}>
              {source.name} ({source.currency})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="declaredBalance" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Saldo Declarado {selectedDeclaracionFS ? `(${selectedDeclaracionFS.currency})` : ''}
        </label>
        <Input
          type="number"
          id="declaredBalance"
          name="declaredBalance"
          value={declaredBalance}
          onChange={(e) => setDeclaredBalance(e.target.value)}
          placeholder="0.00"
          required={transactionType === 'DECLARACION_OPERADOR_INICIO_DIA'}
          step="any"
          disabled={!declaracionFundingSourceId}
        />
      </div>
    </>
  );

  const renderItemTransactionFields = () => (
    <>
      <div>
        <label htmlFor="gameItemId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Ítem de Juego
        </label>
        <select
          id="gameItemId"
          name="gameItemId"
          value={gameItemId}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setGameItemId(e.target.value)}
          required={transactionType === 'COMPRA_ITEM_JUEGO' || transactionType === 'VENTA_ITEM_JUEGO'}
          className={commonSelectClassName}
        >
          <option value="" disabled>Selecciona un ítem...</option>
          {gameItems.map(item => (
            <option key={item._id} value={item._id!}>
              {item.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Cantidad
          </label>
          <Input
            type="number"
            id="quantity"
            name="quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="0"
            required={transactionType === 'COMPRA_ITEM_JUEGO' || transactionType === 'VENTA_ITEM_JUEGO'}
            min="0.00000001"
            step="any"
          />
        </div>
        <div>
          <label htmlFor="unitPriceAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Precio Unitario ({unitPriceCurrency})
          </label>
          <Input
            type="number"
            id="unitPriceAmount"
            name="unitPriceAmount"
            value={unitPriceAmount}
            onChange={(e) => setUnitPriceAmount(e.target.value)}
            placeholder="0.00"
            required={transactionType === 'COMPRA_ITEM_JUEGO' || transactionType === 'VENTA_ITEM_JUEGO'}
            min="0"
            step="any"
          />
        </div>
      </div>
      
      <div>
        <label htmlFor="paymentFundingSourceId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Fuente de Fondos (Pago/Cobro)
        </label>
        <select
          id="paymentFundingSourceId"
          name="paymentFundingSourceId"
          value={paymentFundingSourceId}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPaymentFundingSourceId(e.target.value)}
          required={transactionType === 'COMPRA_ITEM_JUEGO' || transactionType === 'VENTA_ITEM_JUEGO'}
          className={commonSelectClassName}
        >
          <option value="" disabled>Selecciona una fuente para el pago/cobro...</option>
          {fundingSources.map(source => (
            <option key={source._id} value={source._id!}>
              {source.name} ({source.currency})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="paymentAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Monto Total del Pago {paymentCurrency ? `(${paymentCurrency})` : ''}
        </label>
        <Input
          type="number"
          id="paymentAmount"
          name="paymentAmount"
          value={paymentAmount}
          onChange={(e) => setPaymentAmount(e.target.value)}
          placeholder="0.00"
          required={transactionType === 'COMPRA_ITEM_JUEGO' || transactionType === 'VENTA_ITEM_JUEGO'}
          step="any"
          readOnly
        />
      </div>

      <div>
        <label htmlFor="contactId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Contacto (Cliente/Proveedor)
        </label>
        <select
          id="contactId"
          name="contactId"
          value={contactId}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setContactId(e.target.value)}
          className={commonSelectClassName}
        >
          <option value="" disabled>Selecciona un contacto (opcional)...</option>
          {contacts.map(contact => (
            <option key={contact._id} value={contact._id!}>
              {contact.name} ({contact.primaryEmail || contact.primaryPhone || contact.nickname || 'N/A'})
            </option>
          ))}
        </select>
      </div>
    </>
  );

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 shadow rounded-lg p-6 md:p-8">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
            {pageTitle}
          </h1>
          
          {error && <Notification type="error" message={error} onClose={() => setError(null)} />}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="transactionType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tipo de Transacción
              </label>
              <select
                id="transactionType"
                name="transactionType"
                value={transactionType}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  const newType = e.target.value as TransactionType;
                  setTransactionType(newType);
                  setDeclaracionFundingSourceId('');
                  setDeclaredBalance('');
                  setGameItemId('');
                  setQuantity('');
                  setUnitPriceAmount('');
                  setPaymentFundingSourceId('');
                  setPaymentAmount('');
                  setContactId('');
                }}
                required
                className={commonSelectClassName}
              >
                {AVAILABLE_TRANSACTION_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            {transactionType === 'DECLARACION_OPERADOR_INICIO_DIA' && renderDeclaracionFields()}
            {(transactionType === 'COMPRA_ITEM_JUEGO' || transactionType === 'VENTA_ITEM_JUEGO') && renderItemTransactionFields()}

            <div>
              <label htmlFor="transactionDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fecha de Transacción
              </label>
              <Input
                type="date"
                id="transactionDate"
                name="transactionDate"
                value={transactionDate}
                onChange={(e) => setTransactionDate(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notas (Opcional)
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-white"
                placeholder="Notas adicionales..."
              />
            </div>

            <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button 
                type="button" 
                variant="secondary" 
                onClick={() => navigate(Pathnames.transactions.history || Pathnames.home)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                variant="primary" 
                isLoading={isLoading} 
                disabled={isLoading || isFetchingInitialData || 
                  (transactionType === 'DECLARACION_OPERADOR_INICIO_DIA' && !declaracionFundingSourceId) ||
                  ((transactionType === 'COMPRA_ITEM_JUEGO' || transactionType === 'VENTA_ITEM_JUEGO') && (!gameItemId || !paymentFundingSourceId))
                }
              >
                {submitButtonText}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default NewTransactionPage; 