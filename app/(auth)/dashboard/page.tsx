import { auth, currentUser } from '@clerk/nextjs/server';
import { getQuestionBanks } from '@/lib/api/documents-api';
import { getDocuments } from '@/lib/api/django-api';
import DashboardContent from '@/components/dashboard/DashboardContent';

export default async function DashboardPage() {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  // Obtener token para llamadas autenticadas
  const { getToken } = await auth();
  const token = await getToken();

  const banks = await getQuestionBanks(token);
  const documents = await getDocuments(token);

  // Serialize user data to plain object for Client Component
  const userData = {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    emailAddresses: user.emailAddresses.map(email => ({
      emailAddress: email.emailAddress,
      id: email.id,
    })),
    imageUrl: user.imageUrl,
  };

  return <DashboardContent user={userData} banks={banks} documents={documents} />;
}
