'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { Transaction } from '@/lib/types';

export function TransactionList() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const data = await api.getTransactions();
        setTransactions(data);
      } catch (err) {
        console.error('Failed to fetch transactions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  if (loading) {
    return (
      <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-indigo-800 font-bold text-xl flex items-center gap-2">
            <span role="img" aria-label="history">📜</span> Transaction History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-indigo-700">Loading transactions...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-md">
      <CardHeader>
        <CardTitle className="text-indigo-800 font-bold text-xl flex items-center gap-2">
          <span role="img" aria-label="history">📜</span> Payment History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <p className="text-gray-500 text-center">No transactions found</p>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div
                key={transaction._id}
                className="border rounded-lg p-4 flex justify-between items-center bg-indigo-50 hover:bg-amber-50 transition"
              >
                <div>
                  <p className="font-medium text-indigo-900">₹{transaction.amount / 100}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(transaction.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-400">
                    ID: {transaction.paymentId}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    transaction.status === 'success'
                      ? 'bg-green-100 text-green-800'
                      : transaction.status === 'failed'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {transaction.status.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}