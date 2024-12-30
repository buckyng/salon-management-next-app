'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useOrganization } from '@clerk/nextjs';
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

// Validation schema using zod
const inviteSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  role: z.string().nonempty('Please select a role'),
});

type InviteFormValues = z.infer<typeof inviteSchema>;

export const InviteMember = () => {
  const { isLoaded, organization, invitations } = useOrganization({
    invitations: {
      pageSize: 5,
      keepPreviousData: true,
    },
  });

  const [fetchedRoles, setFetchedRoles] = useState<string[]>([]);
  const isPopulated = useRef(false);

  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: '',
      role: '',
    },
  });

  useEffect(() => {
    if (isPopulated.current || !organization) return;

    organization
      .getRoles({ pageSize: 20, initialPage: 1 })
      .then((res) => {
        setFetchedRoles(res.data.map((role) => role.key));
        isPopulated.current = true;
      })
      .catch((error) => console.error('Error fetching roles:', error));
  }, [organization]);

  if (!isLoaded || !organization) {
    return <p>Loading...</p>;
  }

  const handleSubmit = async (data: InviteFormValues) => {
    try {
      await organization.inviteMember({
        emailAddress: data.email,
        role: data.role,
      });
      await invitations?.revalidate?.();
      form.reset();
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
                {fetchedRoles.map((role) => (
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
