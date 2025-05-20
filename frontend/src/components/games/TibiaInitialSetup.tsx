import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import gameService from '../../services/game.service';
import Card from '../common/Card';
import Button from '../common/Button';
import { LoadingSpinner } from '../common';
import { TIBIA_CONFIG } from '../../config/games/tibia/config';
import type { CreateGameData, CreateGameItemData } from '../../types/game.types';

const TibiaInitialSetup: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSetupTibia = async () => {
    setIsLoading(true);
    try {
      // Crear el juego Tibia
      const gameData: CreateGameData = {
        name: TIBIA_CONFIG.name,
        shortName: TIBIA_CONFIG.shortName,
        description: 'Tibia es un MMORPG clásico desarrollado por CipSoft.',
        status: 'active' as const,
        platform: ['PC']
      };

      const game = await gameService.createGame(gameData);
      toast.success('Juego Tibia creado exitosamente');

      // Crear los items predefinidos
      for (const item of TIBIA_CONFIG.predefinedItems) {
        const attributes = [
          {
            name: 'followsGameRules',
            value: item.rules.followsGameRules.toString()
          }
        ];

        // Agregar atributos específicos solo si existen en las reglas
        if ('customMultiplier' in item.rules) {
          attributes.push({
            name: 'customMultiplier',
            value: item.rules.customMultiplier.toString()
          });
        }

        if ('customPackageSize' in item.rules) {
          attributes.push({
            name: 'customPackageSize',
            value: item.rules.customPackageSize.toString()
          });
        }

        const itemData: CreateGameItemData = {
          gameId: game._id,
          name: item.name,
          itemCode: item.itemCode,
          type: item.type,
          description: `${item.name} para ${TIBIA_CONFIG.name}`,
          stackable: true,
          isTradable: true,
          managesStock: true,
          currentStock: 0,
          status: 'active' as const,
          attributes
        };

        await gameService.createGameItem(itemData);
      }

      toast.success('Items de Tibia creados exitosamente');
      navigate(`/admin/games/${game._id}/items`);
    } catch (error) {
      console.error('Error en la configuración inicial de Tibia:', error);
      toast.error('Error al configurar Tibia. Por favor, intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Configuración Inicial de Tibia
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Configura automáticamente el juego Tibia con sus items predefinidos
        </p>
      </div>

      <div className="space-y-4">
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            Items que se crearán:
          </h3>
          <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
            <li>Tibia Coins (TC) - Moneda del juego</li>
            <li>Recovery Key (RK) - Servicio de recuperación</li>
          </ul>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            Configuración de Tibia Coins:
          </h3>
          <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
            <li>Multiplicador: 25 TC</li>
            <li>Tamaño de paquete base: 250 TC</li>
            <li>Mínimo por transacción: 25 TC</li>
          </ul>
        </div>

        {isLoading ? (
          <LoadingSpinner message="Configurando Tibia..." />
        ) : (
          <Button
            variant="primary"
            onClick={handleSetupTibia}
            className="w-full"
          >
            Configurar Tibia
          </Button>
        )}
      </div>
    </Card>
  );
};

export default TibiaInitialSetup; 