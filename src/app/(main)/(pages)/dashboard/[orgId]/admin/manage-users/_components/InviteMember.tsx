'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRoles } from '@/hooks/useRoles';

// Validation schema using zod
const inviteSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  role: z.string().nonempty('Please select a role'),
});

type InviteFormValues = z.infer<typeof inviteSchema>;

export const InviteMember = ({ orgId }: { orgId: string }) => {
  const { roles, loading: loadingRoles } = useRoles(orgId);

  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: '',
      role: '',
    },
  });

  if (loadingRoles) {
    return <p>Loading...</p>;
  }

  const handleSubmit = async (data: InviteFormValues) => {
    try {
      const res = await fetch('/api/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        console.error('Error inviting member:', error);
      } else {
        form.reset();
        alert('Invitation sent successfully!');
      }
    } catch (error) {
      console.error('Error inviting member:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input {...form.register('email')} placeholder="Enter email" />
          </FormControl>
          <FormMessage />
        </FormItem>

        <FormItem>
          <FormLabel>Role</FormLabel>
          <FormControl>
            <Select
              onValueChange={(value) => form.setValue('role', value)}
              defaultValue=""
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage>{form.formState.errors.role?.message}</FormMessage>
        </FormItem>

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Inviting...' : 'Send Invite'}
        </Button>
      </form>
    </Form>
  );
};
