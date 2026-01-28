export const metadata = {
  title: 'Verify Certificate | Hackwise 2.0',
  description:
    'Verify the authenticity of your Hackwise 2.0 certificate by entering the official HW2-2026-XXXX code issued by Sphere Hive.',
  openGraph: {
    title: 'Verify Hackwise 2.0 Certificate',
    description:
      'Enter your Hackwise 2.0 certificate code (HW2-2026-XXXX) to confirm if it is officially issued by the organizers.',
    url: 'https://hackwise.spherehive.in/verify',
    type: 'website',
  },
};

export default function VerifyLayout({ children }) {
  return <>{children}</>;
}


