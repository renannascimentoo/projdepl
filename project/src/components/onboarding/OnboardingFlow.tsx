import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Upload, Calendar, User } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface OnboardingData {
  exName: string;
  breakupDate: string;
  exPhotos: File[];
  phoneNumber: string;
  email: string;
  socialMedia: {
    instagram: string;
    facebook: string;
    twitter: string;
  };
}

interface OnboardingFlowProps {
  onComplete: (data: OnboardingData) => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    exName: '',
    breakupDate: '',
    exPhotos: [],
    phoneNumber: '',
    email: '',
    socialMedia: {
      instagram: '',
      facebook: '',
      twitter: ''
    }
  });

  const steps = [
    {
      id: 'basic-info',
      title: 'Informações Básicas',
      description: 'Vamos começar com as informações essenciais'
    },
    {
      id: 'photos',
      title: 'Fotos para Identificação',
      description: 'Envie algumas fotos para ajudar a identificar seu ex nas suas memórias'
    },
    {
      id: 'contact-info',
      title: 'Informações de Contato',
      description: 'Dados de contato para limpeza completa'
    },
    {
      id: 'social-media',
      title: 'Redes Sociais',
      description: 'Conecte suas redes sociais para limpeza automática'
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(data);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setData(prev => ({
        ...prev,
        exPhotos: Array.from(e.target.files || [])
      }));
    }
  };

  const renderStep = () => {
    switch (steps[currentStep].id) {
      case 'basic-info':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do(a) ex-parceiro(a)
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={data.exName}
                  onChange={(e) => setData(prev => ({ ...prev, exName: e.target.value }))}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Nome completo"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data do término
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="date"
                  value={data.breakupDate}
                  onChange={(e) => setData(prev => ({ ...prev, breakupDate: e.target.value }))}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        );

      case 'photos':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="w-12 h-12 text-purple-600" />
              </div>
              <p className="text-gray-600 mb-6">
                Envie 2-5 fotos claras do seu ex-parceiro para que nossa IA possa identificá-lo em suas memórias
              </p>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-purple-400 transition-colors">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
                id="photo-upload"
              />
              <label htmlFor="photo-upload" className="cursor-pointer">
                <div className="space-y-2">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                  <p className="text-gray-600">Clique para enviar fotos</p>
                  <p className="text-sm text-gray-400">PNG, JPG até 10MB cada</p>
                </div>
              </label>
            </div>

            {data.exPhotos.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {data.exPhotos.map((photo, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(photo)}
                      alt={`Foto ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'contact-info':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de telefone
              </label>
              <input
                type="tel"
                value={data.phoneNumber}
                onChange={(e) => setData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="(11) 99999-9999"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={data.email}
                onChange={(e) => setData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="email@exemplo.com"
              />
            </div>
          </div>
        );

      case 'social-media':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instagram
              </label>
              <input
                type="text"
                value={data.socialMedia.instagram}
                onChange={(e) => setData(prev => ({
                  ...prev,
                  socialMedia: { ...prev.socialMedia, instagram: e.target.value }
                }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="@username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Facebook
              </label>
              <input
                type="text"
                value={data.socialMedia.facebook}
                onChange={(e) => setData(prev => ({
                  ...prev,
                  socialMedia: { ...prev.socialMedia, facebook: e.target.value }
                }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Nome do perfil"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Twitter/X
              </label>
              <input
                type="text"
                value={data.socialMedia.twitter}
                onChange={(e) => setData(prev => ({
                  ...prev,
                  socialMedia: { ...prev.socialMedia, twitter: e.target.value }
                }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="@username"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Configuração Inicial</h2>
            <span className="text-sm text-gray-500">
              {currentStep + 1} de {steps.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Step Content */}
        <Card className="p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {steps[currentStep].title}
                </h3>
                <p className="text-gray-600">
                  {steps[currentStep].description}
                </p>
              </div>

              {renderStep()}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <Button
              variant="ghost"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center space-x-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Anterior</span>
            </Button>

            <Button
              onClick={handleNext}
              className="flex items-center space-x-2"
            >
              <span>{currentStep === steps.length - 1 ? 'Finalizar' : 'Próximo'}</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};