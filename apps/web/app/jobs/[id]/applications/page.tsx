import { ArrowLeft, CheckCircle, XCircle, User, FileText, ExternalLink, MessageCircle } from 'lucide-react';
import ApplicationsContent from './content';

export async function generateStaticParams() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/jobs`);
    const jobs = await response.json();
    return jobs.map((job: any) => ({
      id: job.id.toString()
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ApplicationsPage({ params }: PageProps) {
  const { id } = await params;
  
  return <ApplicationsContent jobId={id} />;
