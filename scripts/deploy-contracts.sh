#!/bin/bash

# Script para compilar y desplegar smart contracts
echo "Compilando y desplegando smart contracts..."

cd /home/ubuntu/blockchain-inventory-system/contracts

# Compilar contratos
echo "Compilando contratos..."
npx truffle compile

if [ $? -eq 0 ]; then
    echo "Compilación exitosa!"
    
    # Desplegar contratos
    echo "Desplegando contratos en la red de desarrollo..."
    npx truffle migrate --network development --reset
    
    if [ $? -eq 0 ]; then
        echo "Despliegue exitoso!"
        echo "Los contratos han sido desplegados en la blockchain local."
    else
        echo "Error en el despliegue. Verifica que Ganache esté ejecutándose."
        exit 1
    fi
else
    echo "Error en la compilación. Revisa el código de los contratos."
    exit 1
fi

