import type { Metadata } from 'next';
import { Inspector } from 'react-dev-inspector';
import './globals.css';

export const metadata: Metadata = {
  title: '权达开猜数字破解器',
  description: '5位不重复数字猜谜破解工具 - 解题助手',
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDev = process.env.COZE_PROJECT_ENV === 'DEV';

  return (
    <html lang="zh-CN" className="dark">
      <body className={`antialiased bg-[#0f1117]`}>
        {isDev && <Inspector />}
        {children}
      </body>
    </html>
  );
}
