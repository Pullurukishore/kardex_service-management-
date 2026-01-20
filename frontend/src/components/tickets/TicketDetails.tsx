import { Ticket, TicketStatus } from '@/types/ticket';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';

type TicketDetailsProps = {
  ticket: Ticket;
  onStatusChange: (status: TicketStatus) => Promise<void>;
};

export function TicketDetails({ ticket, onStatusChange }: TicketDetailsProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-line">{ticket.description}</p>
        </CardContent>
      </Card>

      {/* Contact Person Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>👤</span>
            Contact Person
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(() => {
            const ticketWithContact = ticket as any;
            const contactPerson = ticketWithContact.contact;
            
            if (!contactPerson) {
              return (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">No contact information available</p>
                </div>
              );
            }
            
            return (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="font-medium">{contactPerson.name || 'N/A'}</span>
                </div>
                
                {contactPerson.phone && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phone:</span>
                    <a 
                      href={`tel:${contactPerson.phone}`}
                      className="text-[#546A7A] hover:text-[#546A7A] font-mono hover:underline"
                    >
                      📞 {contactPerson.phone}
                    </a>
                  </div>
                )}
                
                {contactPerson.email && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <a 
                      href={`mailto:${contactPerson.email}`}
                      className="text-[#546A7A] hover:text-[#546A7A] break-all hover:underline"
                    >
                      ✉️ {contactPerson.email}
                    </a>
                  </div>
                )}
                
                {contactPerson.role && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Role:</span>
                    <span className="capitalize">{contactPerson.role.toLowerCase().replace('_', ' ')}</span>
                  </div>
                )}
              </div>
            );
          })()}
        </CardContent>
      </Card>

      {ticket.errorDetails && (
        <Card>
          <CardHeader>
            <CardTitle>Error Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-[#E17F70]/10 p-4 rounded-md">
              <pre className="whitespace-pre-wrap text-sm">{ticket.errorDetails}</pre>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-[#96AEC2]/20 flex items-center justify-center">
                <span className="text-[#546A7A]">1</span>
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-[#546A7A]">Ticket Created</div>
                <div className="text-sm text-[#AEBFC3]0">
                  {format(new Date(ticket.createdAt), 'MMM d, yyyy hh:mm a')}
                </div>
              </div>
            </div>

            {ticket.status === TicketStatus.CLOSED_PENDING && (
              <div className="flex items-start">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-[#A2B9AF]/20 flex items-center justify-center">
                  <span className="text-[#4F6A64]">✓</span>
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-[#546A7A]">Pending Closure</div>
                  <div className="text-sm text-[#AEBFC3]0">
                    {format(new Date(ticket.updatedAt), 'MMM d, yyyy hh:mm a')}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
