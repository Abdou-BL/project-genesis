import { Mail, MessageSquare, AlertTriangle, Reply } from "lucide-react";

export interface LetterTemplate {
  id: string;
  icon: any;
  label: { en: string; fr: string };
  template: { en: string; fr: string };
}

export interface LetterCategory {
  id: string;
  icon: any;
  label: { en: string; fr: string };
  templates: LetterTemplate[];
}

export const LETTER_CATEGORIES: LetterCategory[] = [
  {
    id: "request",
    icon: Mail,
    label: { en: "Request", fr: "Demande" },
    templates: [
      {
        id: "request-budget",
        icon: Mail,
        label: { en: "Budget Request", fr: "Demande de budget" },
        template: {
          en: `[Your Name]\n[Your Title / Position]\n[Department]\n[Date]\n\nTo: [Recipient Name]\n[Recipient Title]\n\nSubject: Request for Budget Allocation\n\nDear [Mr./Mrs. Recipient],\n\nI respectfully submit this request for a budget allocation of [amount] for [purpose].\n\nJustification:\n[Explain the reasons and importance of this request]\n\nI kindly ask for your approval and remain at your disposal for any additional information.\n\nRespectfully,\n\n[Your Name]\n[Signature]`,
          fr: `[Votre Nom]\n[Votre Titre / Poste]\n[Département]\n[Date]\n\nÀ : [Nom du destinataire]\n[Titre du destinataire]\n\nObjet : Demande d'allocation budgétaire\n\nMadame, Monsieur,\n\nJ'ai l'honneur de soumettre cette demande d'allocation budgétaire de [montant] pour [objectif].\n\nJustification :\n[Expliquer les raisons et l'importance de cette demande]\n\nJe vous serais reconnaissant(e) de bien vouloir donner suite à cette demande.\n\nRespecteusement,\n\n[Votre nom]\n[Signature]`,
        },
      },
      {
        id: "request-leave",
        icon: Mail,
        label: { en: "Leave Request", fr: "Demande de congé" },
        template: {
          en: `[Your Name]\n[Your Title]\n[Department]\n[Date]\n\nTo: [Supervisor Name]\n[Supervisor Title]\n\nSubject: Leave Request\n\nDear [Mr./Mrs. Supervisor],\n\nI am writing to request leave from [start date] to [end date] for [reason].\n\nDuring my absence, [colleague name] will handle my responsibilities.\n\nThank you for considering my request.\n\nSincerely,\n\n[Your Name]`,
          fr: `[Votre Nom]\n[Votre Titre]\n[Département]\n[Date]\n\nÀ : [Nom du superviseur]\n[Titre du superviseur]\n\nObjet : Demande de congé\n\nMadame, Monsieur,\n\nJe souhaite solliciter un congé du [date début] au [date fin] pour [raison].\n\nPendant mon absence, [nom du collègue] assurera mes responsabilités.\n\nJe vous remercie de l'attention portée à ma demande.\n\nCordialement,\n\n[Votre nom]`,
        },
      },
      {
        id: "request-equipment",
        icon: Mail,
        label: { en: "Equipment Request", fr: "Demande d'équipement" },
        template: {
          en: `[Your Name]\n[Department]\n[Date]\n\nTo: [Procurement Officer]\n\nSubject: Request for Equipment\n\nDear [Mr./Mrs.],\n\nI am requesting the following equipment for [department/project]:\n\n1. [Item 1 - quantity, specifications]\n2. [Item 2 - quantity, specifications]\n3. [Item 3 - quantity, specifications]\n\nJustification: [Explain why this equipment is needed]\n\nEstimated cost: [Amount]\n\nThank you for your consideration.\n\n[Your Name]\n[Signature]`,
          fr: `[Votre Nom]\n[Département]\n[Date]\n\nÀ : [Responsable des achats]\n\nObjet : Demande d'équipement\n\nMadame, Monsieur,\n\nJe sollicite les équipements suivants pour [département/projet] :\n\n1. [Article 1 - quantité, spécifications]\n2. [Article 2 - quantité, spécifications]\n3. [Article 3 - quantité, spécifications]\n\nJustification : [Expliquer pourquoi cet équipement est nécessaire]\n\nCoût estimé : [Montant]\n\nJe vous remercie de votre considération.\n\n[Votre nom]\n[Signature]`,
        },
      },
      {
        id: "request-transfer",
        icon: Mail,
        label: { en: "Transfer Request", fr: "Demande de mutation" },
        template: {
          en: `[Your Name]\n[Current Position]\n[Current Department]\n[Date]\n\nTo: [HR Director]\n\nSubject: Transfer Request\n\nDear [Mr./Mrs.],\n\nI am writing to request a transfer from [current department] to [desired department/location].\n\nReasons for this request:\n[Explain your motivations]\n\nI believe this transfer would benefit both myself and the organization.\n\nI remain at your disposal for any discussion.\n\nRespectfully,\n\n[Your Name]`,
          fr: `[Votre Nom]\n[Poste actuel]\n[Département actuel]\n[Date]\n\nÀ : [Directeur RH]\n\nObjet : Demande de mutation\n\nMadame, Monsieur,\n\nJe sollicite une mutation du [département actuel] vers [département/lieu souhaité].\n\nMotifs de cette demande :\n[Expliquer vos motivations]\n\nJe suis convaincu(e) que cette mutation serait bénéfique pour l'organisation et moi-même.\n\nJe reste à votre disposition pour tout entretien.\n\nRespecteusement,\n\n[Votre nom]`,
        },
      },
      {
        id: "request-training",
        icon: Mail,
        label: { en: "Training Request", fr: "Demande de formation" },
        template: {
          en: `[Your Name]\n[Position]\n[Department]\n[Date]\n\nTo: [Training Manager / HR]\n\nSubject: Training Request\n\nDear [Mr./Mrs.],\n\nI would like to request authorization to attend the following training:\n\nTraining: [Name of training]\nProvider: [Organization]\nDates: [Start - End]\nCost: [Amount]\n\nThis training will enhance my skills in [area] and benefit [department/project].\n\nThank you for your consideration.\n\n[Your Name]`,
          fr: `[Votre Nom]\n[Poste]\n[Département]\n[Date]\n\nÀ : [Responsable formation / RH]\n\nObjet : Demande de formation\n\nMadame, Monsieur,\n\nJe souhaite solliciter l'autorisation de suivre la formation suivante :\n\nFormation : [Nom de la formation]\nOrganisme : [Organisation]\nDates : [Début - Fin]\nCoût : [Montant]\n\nCette formation renforcera mes compétences en [domaine] et bénéficiera à [département/projet].\n\nJe vous remercie de votre considération.\n\n[Votre nom]`,
        },
      },
    ],
  },
  {
    id: "invitation",
    icon: MessageSquare,
    label: { en: "Invitation", fr: "Invitation" },
    templates: [
      {
        id: "invitation-meeting",
        icon: MessageSquare,
        label: { en: "Meeting Invitation", fr: "Invitation à une réunion" },
        template: {
          en: `[Ministry / Department]\n[Date]\n\nTo: [Recipient Name]\n[Title]\n\nSubject: Invitation to Meeting\n\nDear [Mr./Mrs.],\n\nYou are cordially invited to attend a meeting on [topic].\n\nDate: [Date]\nTime: [Time]\nVenue: [Location]\n\nAgenda:\n1. [Item 1]\n2. [Item 2]\n3. [Item 3]\n\nYour presence is highly valued. Please confirm your attendance by [date].\n\nSincerely,\n\n[Your Name]\n[Title]`,
          fr: `[Ministère / Département]\n[Date]\n\nÀ : [Nom du destinataire]\n[Titre]\n\nObjet : Invitation à une réunion\n\nMadame, Monsieur,\n\nVous êtes cordialement invité(e) à assister à une réunion sur [sujet].\n\nDate : [Date]\nHeure : [Heure]\nLieu : [Lieu]\n\nOrdre du jour :\n1. [Point 1]\n2. [Point 2]\n3. [Point 3]\n\nVotre présence est très appréciée. Veuillez confirmer votre participation avant le [date].\n\nCordialement,\n\n[Votre nom]\n[Titre]`,
        },
      },
      {
        id: "invitation-conference",
        icon: MessageSquare,
        label: { en: "Conference Invitation", fr: "Invitation à une conférence" },
        template: {
          en: `[Organization Name]\n[Date]\n\nDear [Mr./Mrs.],\n\nWe are pleased to invite you to the [Conference Name] on [topic].\n\nDate: [Date]\nVenue: [Location]\nRegistration deadline: [Date]\n\nKey speakers:\n- [Speaker 1]\n- [Speaker 2]\n\nPlease register at [link/contact] by [deadline].\n\nWe look forward to your participation.\n\nBest regards,\n\n[Organizer Name]\n[Contact Information]`,
          fr: `[Nom de l'organisation]\n[Date]\n\nMadame, Monsieur,\n\nNous avons le plaisir de vous inviter à [Nom de la conférence] sur [sujet].\n\nDate : [Date]\nLieu : [Lieu]\nDate limite d'inscription : [Date]\n\nIntervenants principaux :\n- [Intervenant 1]\n- [Intervenant 2]\n\nVeuillez vous inscrire à [lien/contact] avant le [date limite].\n\nNous nous réjouissons de votre participation.\n\nCordialement,\n\n[Nom de l'organisateur]\n[Coordonnées]`,
        },
      },
      {
        id: "invitation-ceremony",
        icon: MessageSquare,
        label: { en: "Official Ceremony", fr: "Cérémonie officielle" },
        template: {
          en: `[Ministry / Institution]\n\nOFFICIAL INVITATION\n\nThe [Minister/Director] has the honour to invite you to the [ceremony name].\n\nDate: [Date]\nTime: [Time]\nVenue: [Location]\nDress code: [Formal/Business]\n\nRSVP by [date] to [contact].\n\n[Name]\n[Title]`,
          fr: `[Ministère / Institution]\n\nINVITATION OFFICIELLE\n\nLe [Ministre/Directeur] a l'honneur de vous inviter à [nom de la cérémonie].\n\nDate : [Date]\nHeure : [Heure]\nLieu : [Lieu]\nCode vestimentaire : [Formel/Professionnel]\n\nRSVP avant le [date] à [contact].\n\n[Nom]\n[Titre]`,
        },
      },
      {
        id: "invitation-workshop",
        icon: MessageSquare,
        label: { en: "Workshop Invitation", fr: "Invitation à un atelier" },
        template: {
          en: `[Department]\n[Date]\n\nDear Colleagues,\n\nYou are invited to a workshop on [topic].\n\nDate: [Date]\nTime: [Start - End]\nLocation: [Venue]\nFacilitator: [Name]\n\nObjectives:\n- [Objective 1]\n- [Objective 2]\n\nPlease bring [materials if any]. Confirm attendance by [date].\n\nBest regards,\n\n[Your Name]`,
          fr: `[Département]\n[Date]\n\nChers collègues,\n\nVous êtes invité(e)s à un atelier sur [sujet].\n\nDate : [Date]\nHeure : [Début - Fin]\nLieu : [Lieu]\nAnimateur : [Nom]\n\nObjectifs :\n- [Objectif 1]\n- [Objectif 2]\n\nVeuillez apporter [matériels si nécessaire]. Confirmez votre présence avant le [date].\n\nCordialement,\n\n[Votre nom]`,
        },
      },
      {
        id: "invitation-delegation",
        icon: MessageSquare,
        label: { en: "Delegation Visit", fr: "Visite de délégation" },
        template: {
          en: `[Ministry / Department]\n[Date]\n\nTo: [Foreign Delegation / Partner]\n\nSubject: Invitation for Official Visit\n\nDear [Excellency / Mr./Mrs.],\n\nOn behalf of [Ministry], I have the pleasure of inviting your delegation to visit [location] from [start date] to [end date].\n\nPurpose: [Describe the purpose]\n\nWe will arrange accommodation and transportation.\n\nPlease confirm participation by [date].\n\nWith highest regards,\n\n[Your Name]\n[Title]`,
          fr: `[Ministère / Département]\n[Date]\n\nÀ : [Délégation étrangère / Partenaire]\n\nObjet : Invitation pour une visite officielle\n\nExcellence / Madame, Monsieur,\n\nAu nom du [Ministère], j'ai le plaisir d'inviter votre délégation à visiter [lieu] du [date début] au [date fin].\n\nObjectif : [Décrire l'objectif]\n\nNous organiserons l'hébergement et le transport.\n\nVeuillez confirmer votre participation avant le [date].\n\nAvec mes salutations les plus distinguées,\n\n[Votre nom]\n[Titre]`,
        },
      },
    ],
  },
  {
    id: "complaint",
    icon: AlertTriangle,
    label: { en: "Complaint", fr: "Réclamation" },
    templates: [
      {
        id: "complaint-service",
        icon: AlertTriangle,
        label: { en: "Service Complaint", fr: "Réclamation de service" },
        template: {
          en: `[Your Name]\n[Your Position]\n[Department]\n[Date]\n\nTo: [Service Manager]\n[Department]\n\nSubject: Complaint Regarding [Service]\n\nDear [Mr./Mrs.],\n\nI am writing to formally report an issue with [service/department].\n\nDescription of the problem:\n[Detailed description of the issue]\n\nDate(s) of occurrence: [Dates]\nImpact: [Describe the impact]\n\nI request that this matter be addressed promptly.\n\nSincerely,\n\n[Your Name]\n[Contact Information]`,
          fr: `[Votre Nom]\n[Votre Poste]\n[Département]\n[Date]\n\nÀ : [Responsable du service]\n[Département]\n\nObjet : Réclamation concernant [Service]\n\nMadame, Monsieur,\n\nJe me permets de signaler un problème concernant [service/département].\n\nDescription du problème :\n[Description détaillée du problème]\n\nDate(s) de survenance : [Dates]\nImpact : [Décrire l'impact]\n\nJe demande que cette situation soit traitée dans les meilleurs délais.\n\nCordialement,\n\n[Votre nom]\n[Coordonnées]`,
        },
      },
      {
        id: "complaint-delay",
        icon: AlertTriangle,
        label: { en: "Delay Complaint", fr: "Réclamation de retard" },
        template: {
          en: `[Your Name]\n[Department]\n[Date]\n\nTo: [Responsible Party]\n\nSubject: Complaint - Unacceptable Delay\n\nDear [Mr./Mrs.],\n\nI am writing to express my concern regarding the significant delay in [describe the delayed action/delivery].\n\nOriginal deadline: [Date]\nCurrent status: [Describe]\nDays overdue: [Number]\n\nThis delay has caused [describe consequences].\n\nI urge you to take immediate corrective action and provide a revised timeline.\n\nRegards,\n\n[Your Name]`,
          fr: `[Votre Nom]\n[Département]\n[Date]\n\nÀ : [Partie responsable]\n\nObjet : Réclamation - Retard inacceptable\n\nMadame, Monsieur,\n\nJe me permets d'exprimer ma préoccupation concernant le retard significatif dans [décrire l'action/livraison retardée].\n\nÉchéance initiale : [Date]\nStatut actuel : [Décrire]\nJours de retard : [Nombre]\n\nCe retard a causé [décrire les conséquences].\n\nJe vous prie de prendre des mesures correctives immédiates et de fournir un calendrier révisé.\n\nCordialement,\n\n[Votre nom]`,
        },
      },
      {
        id: "complaint-quality",
        icon: AlertTriangle,
        label: { en: "Quality Complaint", fr: "Réclamation de qualité" },
        template: {
          en: `[Your Name]\n[Department]\n[Date]\n\nTo: [Quality Manager / Supplier]\n\nSubject: Quality Issue - [Product/Service]\n\nDear [Mr./Mrs.],\n\nWe have identified quality issues with [product/service] received on [date].\n\nDetails:\n- Order/Contract reference: [Ref]\n- Issue description: [Describe defects]\n- Quantity affected: [Number]\n\nWe request [replacement/refund/corrective action].\n\nPlease respond within [timeframe].\n\n[Your Name]\n[Title]`,
          fr: `[Votre Nom]\n[Département]\n[Date]\n\nÀ : [Responsable qualité / Fournisseur]\n\nObjet : Problème de qualité - [Produit/Service]\n\nMadame, Monsieur,\n\nNous avons constaté des problèmes de qualité avec [produit/service] reçu le [date].\n\nDétails :\n- Référence commande/contrat : [Réf]\n- Description du problème : [Décrire les défauts]\n- Quantité concernée : [Nombre]\n\nNous demandons [remplacement/remboursement/action corrective].\n\nVeuillez répondre dans un délai de [délai].\n\n[Votre nom]\n[Titre]`,
        },
      },
      {
        id: "complaint-conduct",
        icon: AlertTriangle,
        label: { en: "Conduct Complaint", fr: "Plainte de comportement" },
        template: {
          en: `CONFIDENTIAL\n\n[Your Name]\n[Date]\n\nTo: [HR Director / Ethics Officer]\n\nSubject: Formal Complaint - Professional Conduct\n\nDear [Mr./Mrs.],\n\nI wish to file a formal complaint regarding [describe the conduct issue].\n\nIncident details:\n- Date: [Date]\n- Location: [Place]\n- Person(s) involved: [Names]\n- Witnesses: [If any]\n\nDescription: [Detailed account of what happened]\n\nI request a formal investigation into this matter.\n\nRespectfully,\n\n[Your Name]`,
          fr: `CONFIDENTIEL\n\n[Votre Nom]\n[Date]\n\nÀ : [Directeur RH / Responsable éthique]\n\nObjet : Plainte formelle - Conduite professionnelle\n\nMadame, Monsieur,\n\nJe souhaite déposer une plainte formelle concernant [décrire le problème de conduite].\n\nDétails de l'incident :\n- Date : [Date]\n- Lieu : [Lieu]\n- Personne(s) impliquée(s) : [Noms]\n- Témoins : [Le cas échéant]\n\nDescription : [Récit détaillé de ce qui s'est passé]\n\nJe demande une enquête formelle sur cette affaire.\n\nRespecteusement,\n\n[Votre nom]`,
        },
      },
      {
        id: "complaint-infrastructure",
        icon: AlertTriangle,
        label: { en: "Infrastructure Complaint", fr: "Réclamation d'infrastructure" },
        template: {
          en: `[Your Name]\n[Department]\n[Date]\n\nTo: [Facilities Manager]\n\nSubject: Infrastructure Issue - [Building/Office]\n\nDear [Mr./Mrs.],\n\nI am reporting the following infrastructure issue:\n\nLocation: [Building, floor, room]\nIssue: [Describe - e.g., broken AC, plumbing, electrical]\nSeverity: [High/Medium/Low]\nSince: [Date first noticed]\n\nThis affects [number] employees and impacts [productivity/safety].\n\nPlease arrange for inspection and repair at your earliest convenience.\n\n[Your Name]\n[Contact]`,
          fr: `[Votre Nom]\n[Département]\n[Date]\n\nÀ : [Responsable des installations]\n\nObjet : Problème d'infrastructure - [Bâtiment/Bureau]\n\nMadame, Monsieur,\n\nJe signale le problème d'infrastructure suivant :\n\nEmplacement : [Bâtiment, étage, salle]\nProblème : [Décrire - ex. : climatisation, plomberie, électricité]\nGravité : [Haute/Moyenne/Basse]\nDepuis : [Date de première constatation]\n\nCela affecte [nombre] employés et impacte [productivité/sécurité].\n\nVeuillez organiser une inspection et réparation dans les meilleurs délais.\n\n[Votre nom]\n[Contact]`,
        },
      },
    ],
  },
  {
    id: "response",
    icon: Reply,
    label: { en: "Response", fr: "Réponse" },
    templates: [
      {
        id: "response-approval",
        icon: Reply,
        label: { en: "Approval Response", fr: "Réponse d'approbation" },
        template: {
          en: `[Ministry / Department]\n[Date]\n\nTo: [Requester Name]\n[Title]\n\nRef: [Original request reference]\n\nSubject: Approval of Your Request\n\nDear [Mr./Mrs.],\n\nFurther to your request dated [date] regarding [subject], I am pleased to inform you that your request has been approved.\n\nDetails:\n[Specify approved items, conditions, timeline]\n\nPlease proceed accordingly.\n\nSincerely,\n\n[Your Name]\n[Title]`,
          fr: `[Ministère / Département]\n[Date]\n\nÀ : [Nom du demandeur]\n[Titre]\n\nRéf : [Référence de la demande originale]\n\nObjet : Approbation de votre demande\n\nMadame, Monsieur,\n\nSuite à votre demande du [date] concernant [sujet], j'ai le plaisir de vous informer que votre demande a été approuvée.\n\nDétails :\n[Préciser les éléments approuvés, conditions, délais]\n\nVeuillez procéder en conséquence.\n\nCordialement,\n\n[Votre nom]\n[Titre]`,
        },
      },
      {
        id: "response-rejection",
        icon: Reply,
        label: { en: "Rejection Response", fr: "Réponse de refus" },
        template: {
          en: `[Ministry / Department]\n[Date]\n\nTo: [Requester Name]\n[Title]\n\nRef: [Original request reference]\n\nSubject: Response to Your Request\n\nDear [Mr./Mrs.],\n\nFurther to your request dated [date] regarding [subject], I regret to inform you that your request cannot be approved at this time.\n\nReasons:\n[Explain the reasons for rejection]\n\nYou may [suggest alternative actions or resubmission conditions].\n\nSincerely,\n\n[Your Name]\n[Title]`,
          fr: `[Ministère / Département]\n[Date]\n\nÀ : [Nom du demandeur]\n[Titre]\n\nRéf : [Référence de la demande originale]\n\nObjet : Réponse à votre demande\n\nMadame, Monsieur,\n\nSuite à votre demande du [date] concernant [sujet], j'ai le regret de vous informer que votre demande ne peut être approuvée pour le moment.\n\nMotifs :\n[Expliquer les raisons du refus]\n\nVous pouvez [suggérer des actions alternatives ou conditions de nouvelle soumission].\n\nCordialement,\n\n[Votre nom]\n[Titre]`,
        },
      },
      {
        id: "response-acknowledgement",
        icon: Reply,
        label: { en: "Acknowledgement", fr: "Accusé de réception" },
        template: {
          en: `[Ministry / Department]\n[Date]\n\nTo: [Sender Name]\n[Title]\n\nRef: [Document reference]\n\nSubject: Acknowledgement of Receipt\n\nDear [Mr./Mrs.],\n\nWe acknowledge receipt of your [letter/document/request] dated [date] regarding [subject].\n\nYour [document] has been registered under reference [number] and will be processed within [timeframe].\n\nYou will be notified of the outcome in due course.\n\nSincerely,\n\n[Your Name]\n[Title]`,
          fr: `[Ministère / Département]\n[Date]\n\nÀ : [Nom de l'expéditeur]\n[Titre]\n\nRéf : [Référence du document]\n\nObjet : Accusé de réception\n\nMadame, Monsieur,\n\nNous accusons réception de votre [lettre/document/demande] du [date] concernant [sujet].\n\nVotre [document] a été enregistré sous la référence [numéro] et sera traité dans un délai de [délai].\n\nVous serez informé(e) du résultat en temps voulu.\n\nCordialement,\n\n[Votre nom]\n[Titre]`,
        },
      },
      {
        id: "response-information",
        icon: Reply,
        label: { en: "Information Response", fr: "Réponse d'information" },
        template: {
          en: `[Ministry / Department]\n[Date]\n\nTo: [Requester Name]\n\nRef: [Request reference]\n\nSubject: Response to Information Request\n\nDear [Mr./Mrs.],\n\nIn response to your inquiry dated [date] about [topic], please find below the requested information:\n\n1. [Information point 1]\n2. [Information point 2]\n3. [Information point 3]\n\nShould you require further clarification, please do not hesitate to contact us.\n\nSincerely,\n\n[Your Name]\n[Title]\n[Contact]`,
          fr: `[Ministère / Département]\n[Date]\n\nÀ : [Nom du demandeur]\n\nRéf : [Référence de la demande]\n\nObjet : Réponse à la demande d'information\n\nMadame, Monsieur,\n\nEn réponse à votre demande du [date] concernant [sujet], veuillez trouver ci-dessous les informations demandées :\n\n1. [Point d'information 1]\n2. [Point d'information 2]\n3. [Point d'information 3]\n\nPour toute clarification supplémentaire, n'hésitez pas à nous contacter.\n\nCordialement,\n\n[Votre nom]\n[Titre]\n[Contact]`,
        },
      },
      {
        id: "response-complaint",
        icon: Reply,
        label: { en: "Complaint Response", fr: "Réponse à une réclamation" },
        template: {
          en: `[Ministry / Department]\n[Date]\n\nTo: [Complainant Name]\n\nRef: [Complaint reference]\n\nSubject: Response to Your Complaint\n\nDear [Mr./Mrs.],\n\nWe have carefully reviewed your complaint dated [date] regarding [subject].\n\nFindings:\n[Summarize investigation results]\n\nActions taken:\n1. [Action 1]\n2. [Action 2]\n\nWe apologize for any inconvenience and assure you of our commitment to improving our services.\n\nSincerely,\n\n[Your Name]\n[Title]`,
          fr: `[Ministère / Département]\n[Date]\n\nÀ : [Nom du plaignant]\n\nRéf : [Référence de la réclamation]\n\nObjet : Réponse à votre réclamation\n\nMadame, Monsieur,\n\nNous avons examiné attentivement votre réclamation du [date] concernant [sujet].\n\nConstatations :\n[Résumer les résultats de l'enquête]\n\nMesures prises :\n1. [Action 1]\n2. [Action 2]\n\nNous nous excusons pour tout désagrément et vous assurons de notre engagement à améliorer nos services.\n\nCordialement,\n\n[Votre nom]\n[Titre]`,
        },
      },
    ],
  },
];
