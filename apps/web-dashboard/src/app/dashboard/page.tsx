'use client';

import { motion } from 'framer-motion';
import {
  DollarSign,
  ShoppingBag,
  Users,
  TrendingUp,
  Package,
  ShoppingCart,
} from 'lucide-react';

const stats = [
  {
    title: 'Total Revenue',
    value: '$45,231.89',
    change: '+20.1%',
    icon: DollarSign,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    title: 'Orders',
    value: '2,350',
    change: '+15.3%',
    icon: ShoppingCart,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    title: 'Products',
    value: '892',
    change: '+12',
    icon: Package,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  {
    title: 'Customers',
    value: '1,249',
    change: '+18.2%',
    icon: Users,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of your e-commerce store</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;

          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                    <TrendingUp size={16} />
                    {stat.change} from last month
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <Icon className={stat.color} size={24} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h3>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Order #{1000 + i}</p>
                  <p className="text-sm text-gray-600">2 items • $129.99</p>
                </div>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                  Processing
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Products</h3>
          <div className="space-y-4">
            {[
              { name: 'iPhone 15 Pro', sales: 234, revenue: '$234,166' },
              { name: 'Samsung Galaxy S24', sales: 189, revenue: '$169,011' },
              { name: 'AirPods Pro', sales: 312, revenue: '$77,688' },
              { name: 'MacBook Pro', sales: 89, revenue: '$213,211' },
            ].map((product, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-600">{product.sales} sold</p>
                </div>
                <p className="font-semibold text-gray-900">{product.revenue}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
