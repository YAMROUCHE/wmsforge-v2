import React from 'react';
import { ShoppingCart } from 'lucide-react';

export default function Orders() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
          <ShoppingCart className="w-10 h-10 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Commandes</h1>
        <p className="text-gray-600 text-lg">Bientôt disponible</p>
      </div>
    </div>
  );
}
