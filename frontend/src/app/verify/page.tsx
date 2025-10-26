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
import { BadgeCheck, CheckIcon, CircleX, Clock, CopyIcon, ShieldCheck } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { toastManager } from '@/components/ui/toast'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'


const proofCodeSchema = z.object({
    proofCode: z.string().min(1, "Proof code is required"),
})
type proofCodeFormData = z.infer<typeof proofCodeSchema>

export default function page() {
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle")

    const form = useForm<proofCodeFormData>({
        resolver: zodResolver(proofCodeSchema),
        mode: 'all',
        defaultValues: {
            proofCode: ""
        },
    })
    const { isSubmitting } = form.formState

    const onSubmit = async (data: proofCodeFormData) => {
        let id: string | undefined
        try {
            id = toastManager.add({
                title: "Verifying proof code...",
                type: "loading",
            })

            await new Promise((resolve) => setTimeout(resolve, 2000)) // simulate delay
            toastManager.close(id)

            if (data.proofCode === "123456") {
                toastManager.add({
                    title: "Proof code verified",
                    description: `Proof code "${data.proofCode}" is valid.`,
                    type: "success",
                    timeout: 2000,
                })
                setStatus("success")
            } else {
                toastManager.add({
                    title: "Invalid proof code",
                    description: "The proof code you entered is incorrect.",
                    type: "error",
                    timeout: 3000,
                })
                setStatus("error")
            }
        } catch (err: any) {
            if (id) toastManager.close(id)
            toastManager.add({
                title: "Verification failed",
                description: err.message || "Something went wrong while verifying the code.",
                type: "error",
                timeout: 3000,
            })
        }
    }


    return (
        <BorderLayout id='verify-page' className='mt-3 border-t'>
            <CrossSVG className="absolute -left-3 -top-3 " />
            <CrossSVG className="absolute -right-3 -top-3" />

            <div className="seciton-py">
                <div className="text-center">
                    <div className='font-matter space-y-4 pb-8 flex flex-col items-center justify-center text-center'>
                        {/* title */}
                        <div className='text-[32px] lg:text-[48px] text-[#141414] font-cal text-balance leading-tight'>
                            <h1>Verify Employment Proof</h1>
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
                                <form id="proofCode" onSubmit={form.handleSubmit(onSubmit)}>
                                    <div className='text-start'>
                                        <FieldGroup className='gap-4'>
                                            <Controller
                                                control={form.control}
                                                name="proofCode"
                                                render={({ field, fieldState }) => (
                                                    <Field data-invalid={fieldState.invalid}>
                                                        <div className="flex items-center">
                                                            <FieldLabel htmlFor="proofCode">Proof Code  <span className="text-destructive">*</span></FieldLabel>
                                                        </div>
                                                        <Input
                                                            {...field}
                                                            aria-invalid={fieldState.invalid}
                                                            id="proofCode"
                                                            // type=""
                                                            // autoComplete=""
                                                            placeholder="enter the proof code"
                                                            spellCheck="false"
                                                        />
                                                        {fieldState.invalid && (
                                                            <FieldError errors={[fieldState.error]} />
                                                        )}
                                                    </Field>
                                                )}
                                            />
                                            <Field>
                                                <Button form="proofCode" type="submit" disabled={isSubmitting} className="w-full">
                                                    <LoadingSwap isLoading={isSubmitting}>Verify Proof Code</LoadingSwap>
                                                </Button>
                                            </Field>
                                            {status === "success" && (

                                                <Card className='w-full bg-[#F4F4F4] rounded-md shadow border border-gray relative '>
                                                    <span className="absolute size-1.5 bg-[#C8D4DD] rounded-full left-[7px] top-[7px]" />
                                                    <span className="absolute size-1.5 bg-[#C8D4DD] rounded-full right-[7px] top-[7px]" />
                                                    <span className="absolute size-1.5 bg-[#C8D4DD] rounded-full left-[7px] bottom-[7px]" />
                                                    <span className="absolute size-1.5 bg-[#C8D4DD] rounded-full right-[7px] bottom-[7px]" />

                                                    <CardContent>
                                                        <div className='flex items-center justify-between flex-wrap gap-3'>
                                                            {/* user */}
                                                            <div className="flex items-center gap-3 flex-wrap">
                                                                <Avatar className='size-10 shrink-0'>
                                                                    {/* <AvatarImage src="https://github.com/shadcn.png" /> */}
                                                                    <AvatarFallback>JD</AvatarFallback>
                                                                </Avatar>
                                                                <div>
                                                                    <h6 className="text-lg font-semibold text-gray-900 font-matter leading-none">John Doe</h6>
                                                                    <p className="text-sm text-gray-600 leading-none">Software Engineer</p>
                                                                </div>
                                                            </div>
                                                            {/* company */}
                                                            <div className='flex items-center flex-wrap gap-1'>
                                                                <Badge
                                                                    variant="secondary"
                                                                >
                                                                    Google
                                                                </Badge>
                                                            </div>
                                                        </div>

                                                    </CardContent>
                                                </Card>

                                            )}
                                            {status === "error" && (

                                                <Card className='w-full bg-[#F4F4F4] rounded-md shadow border border-gray relative '>
                                                    <span className="absolute size-1.5 bg-[#C8D4DD] rounded-full left-[7px] top-[7px]" />
                                                    <span className="absolute size-1.5 bg-[#C8D4DD] rounded-full right-[7px] top-[7px]" />
                                                    <span className="absolute size-1.5 bg-[#C8D4DD] rounded-full left-[7px] bottom-[7px]" />
                                                    <span className="absolute size-1.5 bg-[#C8D4DD] rounded-full right-[7px] bottom-[7px]" />

                                                    <CardContent>
                                                        <Empty className='p-1 gap-0'>
                                                            <EmptyHeader>
                                                                <EmptyMedia className='mb-1' variant="icon">
                                                                    <CircleX className='text-destructive' />
                                                                </EmptyMedia>
                                                                <EmptyTitle className='text-lg text-gray-900 font-matter leading-none'>User not found</EmptyTitle>
                                                            </EmptyHeader>
                                                        </Empty>
                                                    </CardContent>
                                                </Card>
                                            )}
                                        </FieldGroup>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>

                        <Card className="w-full max-w-xl shadow-md text-start">
                            <CardContent className="space-y-4">
                                <h5 className="text-lg font-semibold text-gray-900">
                                    How Verification Works
                                </h5>

                                <div className="space-y-3">
                                    {/* Step 1 */}
                                    <div className="flex items-start gap-2">
                                        <div className="shrink-0 pt-1">
                                            <ShieldCheck className="size-4 text-gray-700" />
                                        </div>
                                        <p className="text-sm text-gray-700 leading-relaxed">
                                            Proof codes are generated by verified employees and stored securely
                                            on the Internet Computer blockchain.
                                        </p>
                                    </div>

                                    {/* Step 2 */}
                                    <div className="flex items-start gap-2">
                                        <div className="shrink-0 pt-1">
                                            <Clock className="size-4 text-gray-700" />
                                        </div>
                                        <p className="text-sm text-gray-700 leading-relaxed">
                                            Each proof code is valid for 1 hour from the time of generation.
                                        </p>
                                    </div>

                                    {/* Step 3 */}
                                    <div className="flex items-start gap-2">
                                        <div className="shrink-0 pt-1">
                                            <BadgeCheck className="size-4 text-gray-700" />
                                        </div>
                                        <p className="text-sm text-gray-700 leading-relaxed">
                                            Verification is instant and does not require authentication.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                </div>
            </div>
        </BorderLayout>
    )
}
