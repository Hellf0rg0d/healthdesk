import Mainpart from "./components";

export default async function MedReach({ params }) {

    const { typeId } = await params;
    const speciality = decodeURI(typeId);

    console.log("Speciality in page.jsx:", speciality);

    return (
        <div className="min-h-screen bg-white">
            <Mainpart typeId={speciality} />
        </div>
    );
}