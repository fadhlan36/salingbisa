import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircleIcon } from "lucide-react";

type ErrorAlertProps = {
  message: string;
};

export function ErrorAlert({ message }: ErrorAlertProps) {
  return (
    <Alert variant="destructive" className="border-0">
      <AlertCircleIcon className="h-4 w-4" />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
