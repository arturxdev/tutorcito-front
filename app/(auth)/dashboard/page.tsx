import { auth, currentUser } from '@clerk/nextjs/server';
import DashboardContent from '@/components/dashboard/DashboardContent';
import { getDocuments } from '@/src/entities';

export default async function DashboardPage() {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  // Obtener token para llamadas autenticadas
  const { getToken } = await auth();
  const token = await getToken();

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

  return <DashboardContent user={userData} documents={documents} />;
}
