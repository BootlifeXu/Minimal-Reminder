import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function CardPreview() {
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <Card className="max-w-xl mx-auto">
        <CardHeader>
          <CardTitle>Card Preview</CardTitle>
          <CardDescription>Render individual components in isolation.</CardDescription>
        </CardHeader>
        <CardContent>
          This preview page shows the card component and its basic layout.
        </CardContent>
        <CardFooter>
          <Button>Primary action</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
