import { useCallback, useState } from 'react';
import { Page, ProductionLogRecord } from '../types';
import { createId } from '../utils/id';

interface OperatorRuntimeOptions {
  /** Station currently shown to the operator. */
  station: Page;
  notify: (message: string) => void;
  /** Called when an `exit` action is triggered. */
  onExit: () => void;
  onNavigate: (pageId: string) => void;
}

const NAVIGATION_DELAY_MS = 350;

/**
 * Runtime state shared by test-run mode and the published view: entered field values,
 * recorded production batches and the handler for operator button actions.
 */
export function useOperatorRuntime({ station, notify, onExit, onNavigate }: OperatorRuntimeOptions) {
  const [runtimeValues, setRuntimeValues] = useState<Record<string, any>>({});
  const [productionLogs, setProductionLogs] = useState<ProductionLogRecord[]>([]);

  const setRuntimeValue = useCallback((nodeId: string, value: any) => {
    setRuntimeValues((prev) => ({ ...prev, [nodeId]: value }));
  }, []);

  const resetRuntimeValues = useCallback(() => setRuntimeValues({}), []);
  const clearLogs = useCallback(() => setProductionLogs([]), []);

  const triggerAction = useCallback(
    (actionType: string, meta?: { targetPageId?: string }) => {
      switch (actionType) {
        case 'exit':
          onExit();
          break;

        case 'submit_log': {
          const record: ProductionLogRecord = {
            id: createId('log'),
            timestamp: new Date().toLocaleTimeString(),
            stationId: station.id,
            stationName: station.name,
            workOrderId: 'WO-8842',
            lotNumber: runtimeValues['carrier-barcode-input'] || 'SN-7849-B2',
            operatorId: runtimeValues['operator-id'] || 'OP-402',
            status: 'PASS',
            data: { ...runtimeValues },
          };
          setProductionLogs((prev) => [record, ...prev]);
          notify(`Batch recorded: ${record.lotNumber}`);

          if (meta?.targetPageId) {
            const targetPageId = meta.targetPageId;
            setTimeout(() => onNavigate(targetPageId), NAVIGATION_DELAY_MS);
          }
          break;
        }

        case 'toggle_hold':
          notify('Station placed ON HOLD.');
          break;

        case 'clear_inputs':
          setRuntimeValues({});
          notify('Station input reset.');
          break;
      }
    },
    [station, runtimeValues, notify, onExit, onNavigate]
  );

  return {
    runtimeValues,
    productionLogs,
    setRuntimeValue,
    resetRuntimeValues,
    clearLogs,
    triggerAction,
  };
}
