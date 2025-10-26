"use client"
import BorderLayout from '@/components/layout/borderLayout'
import CrossSVG from '@/components/svg/CrossSVG'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from "@hookform/resolvers/zod"
import z from 'zod'
import { Button } from '@/components/ui/button'
import { LoadingSwap } from '@/components/ui/loading-swap'
import { BadgeCheck, CheckIcon, ChevronDownIcon, Clock, CopyIcon, ShieldCheck } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { toastManager } from '@/components/ui/toast'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'


const generateProofCodeSchema = z.object({
    generateProofCode: z.string().min(1, "Proof code is required"),
})
type generateProofCodeFormData = z.infer<typeof generateProofCodeSchema>

const frameworks = [
    {
        value: "next.js",
        label: "Next.js",
    },
    {
        value: "sveltekit",
        label: "SvelteKit",
    },
    {
        value: "nuxt.js",
        label: "Nuxt.js",
    },
    {
        value: "remix",
        label: "Remix",
    },
    {
        value: "astro",
        label: "Astro",
    },
    {
        value: "angular",
        label: "Angular",
    },
    {
        value: "vue",
        label: "Vue.js",
    },
    {
        value: "react",
        label: "React",
    },
    {
        value: "ember",
        label: "Ember.js",
    },
    {
        value: "gatsby",
        label: "Gatsby",
    },
    {
        value: "eleventy",
        label: "Eleventy",
    },
    {
        value: "solid",
        label: "SolidJS",
    },
    {
        value: "preact",
        label: "Preact",
    },
    {
        value: "qwik",
        label: "Qwik",
    },
    {
        value: "alpine",
        label: "Alpine.js",
    },
    {
        value: "lit",
        label: "Lit",
    },
]

export default function page() {
    const [isTrue, setIsTrue] = useState(false)
    const [copied, setCopied] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)
    const id = "verifiedCode"
    const [open, setOpen] = useState<boolean>(false)
    const [value, setValue] = useState<string>("")

    const form = useForm<generateProofCodeFormData>({
        resolver: zodResolver(generateProofCodeSchema),
        mode: 'all',
        defaultValues: {
            generateProofCode: ""
        },
    })
    const { isSubmitting } = form.formState

    const handleCopy = () => {
        if (inputRef.current) {
            navigator.clipboard.writeText(inputRef.current.value)
            setCopied(true)
            setTimeout(() => setCopied(false), 1500)
        }
    }

    const onSubmit = async (data: generateProofCodeFormData) => {
        let id: string | undefined;

        try {
            id = toastManager.add({
                title: "Verifying proof code...",
                type: "loading",
            });

            // simulate backend verification delay
            await new Promise((resolve) => setTimeout(resolve, 2000));

            toastManager.close(id);

            if (data.generateProofCode === "next.js") {
                toastManager.add({
                    title: "Proof code verified",
                    description: `Proof code "${data.generateProofCode}" is valid.`,
                    type: "success",
                    timeout: 2000,
                });
                setIsTrue(true)
            } else {
                toastManager.add({
                    title: "Invalid proof code",
                    description: "The proof code you entered is incorrect.",
                    type: "error",
                    timeout: 3000,
                });
            }
        } catch (err: any) {
            if (id) toastManager.close(id);

            toastManager.add({
                title: "Verification failed",
                description: err.message || "Something went wrong while verifying the code.",
                type: "error",
                timeout: 3000,
            });
        }
    };


    return (
        <BorderLayout id='verify-page' className='mt-3 border-t'>
            <CrossSVG className="absolute -left-3 -top-3 " />
            <CrossSVG className="absolute -right-3 -top-3" />

            <div className="seciton-py">
                <div className="text-center">
                    <div className='font-matter space-y-4 pb-8 flex flex-col items-center justify-center text-center'>
                        {/* title */}
                        <div className='text-[32px] lg:text-[48px] text-[#141414] font-cal text-balance leading-tight'>
                            <h1>Generate Proof</h1>
                        </div>
                        {/* description */}
                        <div className='text-base lg:text-lg text-gray-700 max-w-2xl'>
                            <h2>
                                Enter a proof code to verify employment status instantly
                            </h2>
                        </div>
                    </div>

                    <div className="w-full flex justify-center flex-col items-center gap-6">
                        <Card className="w-full max-w-xl shadow-md">
                            <CardHeader className='text-start'>
                                <CardTitle>Enter Proof Code</CardTitle>
                                <CardDescription>
                                    Proof codes are in the format: COMPANY_ID-EMPLOYEE_ID-TIMESTAMP
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form id="generateProofCode" onSubmit={form.handleSubmit(onSubmit)}>
                                    <div className='text-start'>
                                        <FieldGroup className='gap-4'>
                                            <Controller
                                                control={form.control}
                                                name="generateProofCode"
                                                render={({ field, fieldState }) => (
                                                    <Field data-invalid={fieldState.invalid}>
                                                        <div className="flex items-center">
                                                            <FieldLabel htmlFor="generateProofCode">Proof Code  <span className="text-destructive">*</span></FieldLabel>
                                                        </div>
                                                        <Popover open={open} onOpenChange={setOpen}>
                                                            <PopoverTrigger asChild>
                                                                <Button
                                                                    id={id}
                                                                    variant="outline"
                                                                    role="combobox"
                                                                    aria-expanded={open}
                                                                    className="w-full justify-between border-input bg-background px-3 font-normal outline-offset-0 outline-none hover:bg-background focus-visible:outline-[3px]"
                                                                >
                                                                    <span className={cn("truncate", !value && "text-muted-foreground")}>
                                                                        {value
                                                                            ? frameworks.find((framework) => framework.value === value)?.label
                                                                            : "Select proof code"}
                                                                    </span>
                                                                    <ChevronDownIcon
                                                                        size={16}
                                                                        className="shrink-0 text-muted-foreground/80"
                                                                        aria-hidden="true"
                                                                    />
                                                                </Button>
                                                            </PopoverTrigger>
                                                            <PopoverContent
                                                                className="w-full min-w-[var(--radix-popper-anchor-width)] border-input p-0"
                                                                align="start"
                                                            >
                                                                <Command>
                                                                    <CommandInput placeholder="Search proof code..." />
                                                                    <CommandList>
                                                                        <CommandEmpty>No proof code found.</CommandEmpty>
                                                                        <CommandGroup>
                                                                            {frameworks.map((framework) => (
                                                                                <CommandItem
                                                                                    key={framework.value}
                                                                                    value={framework.value}
                                                                                    onSelect={(currentValue) => {
                                                                                        setValue(currentValue)
                                                                                        setOpen(false)
                                                                                        form.setValue("generateProofCode", currentValue) // 👈 هنا المفتاح!
                                                                                      }}
                                                                                >
                                                                                    {framework.label}
                                                                                    {value === framework.value && (
                                                                                        <CheckIcon size={16} className="ml-auto" />
                                                                                    )}
                                                                                </CommandItem>
                                                                            ))}
                                                                        </CommandGroup>
                                                                    </CommandList>
                                                                </Command>
                                                            </PopoverContent>
                                                        </Popover>
                                                        {fieldState.invalid && (
                                                            <FieldError errors={[fieldState.error]} />
                                                        )}
                                                    </Field>
                                                )}
                                            />
                                            <Field>
                                                <Button form="generateProofCode" type="submit" disabled={isSubmitting} className="w-full">
                                                    <LoadingSwap isLoading={isSubmitting}>Verify Proof Code</LoadingSwap>
                                                </Button>
                                            </Field>
                                            {isTrue && (
                                                <div className="*:not-first:mt-2">
                                                    <Label htmlFor={id}>Copy to clipboard</Label>
                                                    <div className="relative">
                                                        <Input
                                                            ref={inputRef}
                                                            id={id}
                                                            className="pe-9"
                                                            type="text"
                                                            defaultValue="pnpm install origin-ui"
                                                            readOnly
                                                        />
                                                        <TooltipProvider delayDuration={0}>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <button
                                                                        onClick={handleCopy}
                                                                        className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md text-muted-foreground/80 transition-[color,box-shadow] outline-none hover:text-foreground focus:z-10 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed"
                                                                        aria-label={copied ? "Copied" : "Copy to clipboard"}
                                                                        disabled={copied}
                                                                    >
                                                                        <div
                                                                            className={cn(
                                                                                "transition-all",
                                                                                copied ? "scale-100 opacity-100" : "scale-0 opacity-0"
                                                                            )}
                                                                        >
                                                                            <CheckIcon
                                                                                className="stroke-emerald-500"
                                                                                size={16}
                                                                                aria-hidden="true"
                                                                            />
                                                                        </div>
                                                                        <div
                                                                            className={cn(
                                                                                "absolute transition-all",
                                                                                copied ? "scale-0 opacity-0" : "scale-100 opacity-100"
                                                                            )}
                                                                        >
                                                                            <CopyIcon size={16} aria-hidden="true" />
                                                                        </div>
                                                                    </button>
                                                                </TooltipTrigger>
                                                                <TooltipContent className="px-2 py-1 text-xs">
                                                                    Copy to clipboard
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    </div>
                                                </div>
                                            )
                                            }
                                        </FieldGroup>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                </div>
            </div>
        </BorderLayout>
    )
}
