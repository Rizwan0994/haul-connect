import { Metadata } from "next";
import CarrierProfileForm from "@/components/carrier-management/carrier-profile-form";

export const metadata: Metadata = {
  title: "Carrier Profile",
  description: "View and edit carrier information",
};

type Props = {
  params: Promise<{ id: string }>;
  // searchParams: { [key: string]: string | string[] | undefined };
};

export default async function CarrierProfilePage({ params }: Props) {
  // TODO: Fetch carrier data from API using params.id
  // For now, using "new" as a special case for creating a new carrier
  const { id } = await params;
  const isNewCarrier = id === "new";

  return (
    <div className="container py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">
          {isNewCarrier ? "Add New Carrier" : "Edit Carrier Profile"}
        </h1>
        <p className="text-muted-foreground">
          {isNewCarrier
            ? "Create a new carrier profile with all required information"
            : "Update carrier information and preferences"}
        </p>
      </div>
      <CarrierProfileForm isNew={isNewCarrier} id={id} />
    </div>
  );
}
