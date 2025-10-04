import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Award, BookOpen, Users } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface ResearcherCardProps {
  id: string;
  name: string;
  specialty: string;
  center: string;
  hIndex: number;
  publications: number;
  collaborations: number;
  avatar?: string;
}

const ResearcherCard = ({ 
  id, 
  name, 
  specialty, 
  center, 
  hIndex, 
  publications, 
  collaborations,
  avatar 
}: ResearcherCardProps) => {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2);

  return (
    <Link to={`/chercheurs/${id}`}>
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 hover:shadow-glow transition-all duration-300">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="h-14 w-14 border-2 border-primary/20">
                  <AvatarImage src={avatar} alt={name} />
                  <AvatarFallback className="bg-gradient-accent text-white font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{name}</h3>
                  <p className="text-sm text-muted-foreground">{specialty}</p>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Badge variant="secondary" className="text-xs">
              {center}
            </Badge>
            
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="flex flex-col items-center space-y-1 p-2 rounded-lg bg-secondary/30">
                <Award className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold">{hIndex}</span>
                <span className="text-xs text-muted-foreground">h-index</span>
              </div>
              <div className="flex flex-col items-center space-y-1 p-2 rounded-lg bg-secondary/30">
                <BookOpen className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold">{publications}</span>
                <span className="text-xs text-muted-foreground">Publi.</span>
              </div>
              <div className="flex flex-col items-center space-y-1 p-2 rounded-lg bg-secondary/30">
                <Users className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold">{collaborations}</span>
                <span className="text-xs text-muted-foreground">Collab.</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
};

export default ResearcherCard;
