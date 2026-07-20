import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircleIcon } from "lucide-react";

type SuccessAlertProps = {
  message: string;
};

export function SuccessAlert({ message }: SuccessAlertProps) {
  return (
    <Alert className="border-0 [&>svg]:text-green-600">
      <AlertCircleIcon className="h-4 w-4" />
      <AlertDescription className="text-green-600">{message}</AlertDescription>
    </Alert>
  );
}
