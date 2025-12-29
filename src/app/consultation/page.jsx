import Header from "@/app/components/Header";
import { auth } from "../lib/auth";
import DoctorConsultation from "./doctor";
import PatientConsultation from "./patient";

export default async function ConsultationPage() {

  const session = await auth();

  return (
    <>
      <Header />

      {((session?.role || '').toString().toLowerCase() === 'doctor') ? (
        <DoctorConsultation auth={session} />
      ) : (
        <PatientConsultation auth={session} />
      )}

    </>
  );
}