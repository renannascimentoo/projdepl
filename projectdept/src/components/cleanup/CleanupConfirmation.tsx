import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, X, Check } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface CleanupData {
  messages: { count: number; label: string };
  photos: { count: number; label: string };
  social: { count: number; label: string };
  financial: { count: number; label: string };
}

interface CleanupConfirmationProps {
  cleanupData: CleanupData;
  onConfirm: () => void;
  onCancel: () => void;
  isOpen: boolean;
}

export const CleanupConfirmation: React.FC<CleanupConfirmationProps> = ({
  cleanupData,
  onConfirm,
  onCancel,
  isOpen
}) => {
  const [confirmationText, setConfirmationText] = useState('');
  const [understood, setUnderstood] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const totalItemsToDelete = Object.values(cleanupData).reduce(
    (sum, category) => sum + category.count, 0
  );

  const steps = [
    'Compreensão dos Riscos',
    'Confirmação Final',
    'Última Chance'
  ];

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onConfirm();
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-10 h-10 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                ⚠️ Atenção: Ação Irreversível
              </h2>
              <p className="text-gray-600 text-lg">
                Você está prestes a deletar <strong className="text-red-600">{totalItemsToDelete} itens</strong> permanentemente.
              </p>
            </div>

            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Esta ação NÃO pode ser desfeita
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Todas as fotos, vídeos e mensagens serão deletados para sempre</li>
                      <li>Não haverá backup ou possibilidade de recuperação</li>
                      <li>O processo pode levar alguns minutos para ser concluído</li>
                      <li>Recomendamos fazer backup manual dos itens importantes</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {Object.entries(cleanupData).map(([category, data]) => (
                <div key={category} className="flex justify-between items-center py-3 px-4 bg-gray-50 rounded-lg">
                  <span className="text-gray-700 font-medium">{data.label}</span>
                  <span className="font-bold text-red-600 text-lg">{data.count} itens</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Confirmação de Entendimento
              </h2>
              <p className="text-gray-600">
                Para prosseguir, confirme que você entende os riscos
              </p>
            </div>

            <div className="space-y-4">
              <label className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={understood}
                  onChange={(e) => setUnderstood(e.target.checked)}
                  className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                />
                <div className="text-sm">
                  <span className="font-medium text-gray-900">
                    Eu entendo que esta ação é permanente e irreversível
                  </span>
                  <p className="text-gray-500 mt-1">
                    Confirmo que li e compreendi todos os avisos sobre a exclusão permanente dos dados.
                  </p>
                </div>
              </label>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Digite <strong>"DELETAR TUDO"</strong> para confirmar:
                </label>
                <input
                  type="text"
                  value={confirmationText}
                  onChange={(e) => setConfirmationText(e.target.value.toUpperCase())}
                  className="w-full p-4 border-2 border-gray-300 rounded-xl text-center text-lg font-mono focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="DELETAR TUDO"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Última Chance
              </h2>
              <p className="text-gray-600 text-lg">
                Tem certeza absoluta de que deseja continuar?
              </p>
            </div>

            <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-xl p-6">
              <div className="text-center space-y-3">
                <p className="text-red-800 font-semibold text-lg">
                  {totalItemsToDelete} itens serão deletados permanentemente
                </p>
                <p className="text-red-600">
                  Esta é sua última oportunidade de cancelar
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <Check className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-green-800 font-medium">Continuar</p>
                <p className="text-green-600 text-sm">Deletar tudo e seguir em frente</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                <X className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <p className="text-gray-800 font-medium">Cancelar</p>
                <p className="text-gray-600 text-sm">Manter meus dados seguros</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return true;
      case 1:
        return understood && confirmationText === 'DELETAR TUDO';
      case 2:
        return true;
      default:
        return false;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
    >
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {steps[currentStep]}
              </h3>
              <span className="text-sm text-gray-500">
                {currentStep + 1} de {steps.length}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="h-full bg-gradient-to-r from-red-500 to-pink-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Step Content */}
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStep()}
          </motion.div>

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <Button
              variant="secondary"
              onClick={currentStep === 0 ? onCancel : () => setCurrentStep(currentStep - 1)}
              className="flex items-center space-x-2"
            >
              <span>{currentStep === 0 ? 'Cancelar' : 'Voltar'}</span>
            </Button>

            <Button
              variant={currentStep === steps.length - 1 ? 'danger' : 'primary'}
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex items-center space-x-2"
            >
              <span>
                {currentStep === steps.length - 1 ? 'DELETAR TUDO' : 'Continuar'}
              </span>
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};