import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Sparkles, CheckCircle2, ArrowRight, Palette, Layers, Terminal } from 'lucide-react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl w-full space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Tailwind CSS & shadcn/ui configured
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            FutureMe Frontend
          </h1>
          <p className="text-slate-600 text-base sm:text-lg">
            Ready to build modern, accessible UI components.
          </p>
        </div>

        {/* Feature Card */}
        <Card className="border border-slate-200 shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary" />
              Setup Status
            </CardTitle>
            <CardDescription>
              All configurations and core utilities have been initialized.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 text-emerald-800 text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span><strong>Tailwind CSS:</strong> Active via Vite plugin with custom design tokens.</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 text-emerald-800 text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span><strong>Path Alias:</strong> Configured <code>@/*</code> pointing to <code>src/*</code>.</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 text-emerald-800 text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span><strong>shadcn/ui Core:</strong> Ready with <code>cn()</code> utility, Button, and Card components.</span>
            </div>
          </CardContent>
          <CardFooter className="flex flex-wrap gap-3 pt-2">
            <Button onClick={() => setCount((prev) => prev + 1)}>
              Clicked {count} {count === 1 ? 'time' : 'times'}
            </Button>
            <Button variant="outline" onClick={() => setCount(0)}>
              Reset
            </Button>
            <Button variant="secondary" className="gap-2">
              <Palette className="w-4 h-4" />
              Components Ready
            </Button>
          </CardFooter>
        </Card>

        {/* Quick CLI tip */}
        <div className="rounded-lg bg-slate-900 text-slate-100 p-4 font-mono text-xs space-y-1">
          <div className="flex items-center gap-2 text-slate-400">
            <Terminal className="w-4 h-4" />
            <span>Add more shadcn components:</span>
          </div>
          <p className="text-emerald-400 pl-6">
            npx shadcn@latest add dialog
          </p>
        </div>

      </div>
    </div>
  )
}

export default App
