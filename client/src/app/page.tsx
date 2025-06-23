import Link from 'next/link';
export default function HomePage() {
  return (
    <main className="flex items-center justify-center h-screen">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-blue-600">Welcome to My Payment App</h1>
        <p className="text-gray-600">Built with Next.js + TypeScript + Razorpay</p>
        <div className="space-x-4">
          <Link
            href="/payment"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Make Payment
          </Link>
          <Link
            href="/login" 
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded">
            Login
          </Link>
        </div>
      </div>
    </main>
  );
}
