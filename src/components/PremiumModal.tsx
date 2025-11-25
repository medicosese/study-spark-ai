import { Crown, Zap, Download, Star, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PremiumModal = ({ isOpen, onClose }: PremiumModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 bg-gradient-card border-0">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground z-50"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
        
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-button rounded-full mb-4 shadow-glow">
              <Crown className="w-10 h-10 text-white" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-4xl font-bold text-foreground mb-2">
                Upgrade to Premium
              </DialogTitle>
              <DialogDescription className="text-lg text-muted-foreground">
                Unlock unlimited AI generations and premium features
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <Card className="p-6 bg-background border-border">
              <Zap className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-semibold text-lg mb-2 text-foreground">Unlimited Generations</h3>
              <p className="text-muted-foreground text-sm">
                Generate as many study materials as you need, no limits
              </p>
            </Card>

            <Card className="p-6 bg-background border-border">
              <Download className="w-8 h-8 text-secondary mb-3" />
              <h3 className="font-semibold text-lg mb-2 text-foreground">PDF Export</h3>
              <p className="text-muted-foreground text-sm">
                Download beautifully formatted study materials
              </p>
            </Card>

            <Card className="p-6 bg-background border-border">
              <Star className="w-8 h-8 text-accent mb-3" />
              <h3 className="font-semibold text-lg mb-2 text-foreground">Ad-Free Experience</h3>
              <p className="text-muted-foreground text-sm">
                Focus on learning without any distractions
              </p>
            </Card>

            <Card className="p-6 bg-background border-border">
              <Zap className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-semibold text-lg mb-2 text-foreground">Priority Support</h3>
              <p className="text-muted-foreground text-sm">
                Get help faster with dedicated support
              </p>
            </Card>
          </div>

          <div className="space-y-3">
            <Button
              size="lg"
              className="w-full bg-gradient-button text-primary-foreground hover:opacity-90 shadow-md font-semibold text-lg py-6 rounded-xl transition-all hover:shadow-lg"
            >
              <Crown className="w-5 h-5 mr-2" />
              Coming Soon - Join Waitlist
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Premium features launching soon. Be the first to know!
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
