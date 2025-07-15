#!/bin/bash

# Script para iniciar Ganache CLI con configuración predeterminada
echo "Iniciando Ganache CLI..."

npx ganache-cli \
  --deterministic \
  --accounts 10 \
  --host 0.0.0.0 \
  --port 8545 \
  --networkId 5777 \
  --gasLimit 6721975 \
  --gasPrice 20000000000 \
  --mnemonic "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat"

echo "Ganache CLI iniciado en http://localhost:8545"

