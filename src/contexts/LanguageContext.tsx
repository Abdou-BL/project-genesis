import { createContext, useContext, useState, ReactNode } from "react";

type Lang = "en" | "fr";

const translations: Record<string, Record<Lang, string>> = {
  // Navbar
  "nav.home": { en: "Home", fr: "Accueil" },
  "nav.translation": { en: "Translation", fr: "Traduction" },
  "nav.courses": { en: "Courses", fr: "Cours" },
  "nav.terminology": { en: "Terminology", fr: "Terminologie" },
  "nav.meetings": { en: "Meetings", fr: "Réunions" },
  "nav.dashboard": { en: "Dashboard", fr: "Tableau de bord" },
  "nav.signin": { en: "Sign In", fr: "Connexion" },
  "nav.signout": { en: "Sign Out", fr: "Déconnexion" },
  "nav.profile": { en: "Profile", fr: "Profil" },

  // Hero
  "hero.badge": { en: "Government Language Transition", fr: "Transition linguistique gouvernementale" },
  "hero.title1": { en: "Transform Your", fr: "Transformez Votre" },
  "hero.title2": { en: "Government", fr: "Communication" },
  "hero.title3": { en: "Communication", fr: "Gouvernementale" },
  "hero.desc": {
    en: "Seamlessly transition from French to English with AI-powered translation, professional courses, and a comprehensive terminology bank designed for government institutions.",
    fr: "Passez en douceur du français à l'anglais grâce à la traduction par IA, des cours professionnels et une banque terminologique complète conçue pour les institutions gouvernementales.",
  },
  "hero.getstarted": { en: "Get Started", fr: "Commencer" },
  "hero.trytranslation": { en: "Try Translation", fr: "Essayer la traduction" },

  // Hero cards
  "hero.card1.title": { en: "AI Translation", fr: "Traduction IA" },
  "hero.card1.desc": { en: "Letters & documents translated instantly", fr: "Lettres et documents traduits instantanément" },
  "hero.card2.title": { en: "Online Courses", fr: "Cours en ligne" },
  "hero.card2.desc": { en: "Professional English training", fr: "Formation professionnelle en anglais" },
  "hero.card3.title": { en: "Terminology Bank", fr: "Banque terminologique" },
  "hero.card3.desc": { en: "Government-specific vocabulary", fr: "Vocabulaire spécifique au gouvernement" },
  "hero.card4.title": { en: "Online Meetings", fr: "Réunions en ligne" },
  "hero.card4.desc": { en: "Bilingual collaboration tools", fr: "Outils de collaboration bilingue" },

  // Features
  "features.title1": { en: "Everything You Need for", fr: "Tout ce qu'il vous faut pour la" },
  "features.title2": { en: "Language Transition", fr: "Transition linguistique" },
  "features.desc": {
    en: "A complete platform designed to help government institutions smoothly transition their operations from French to English.",
    fr: "Une plateforme complète conçue pour aider les institutions gouvernementales à passer en douceur du français à l'anglais.",
  },
  "features.f1.title": { en: "AI-Powered Translation", fr: "Traduction par IA" },
  "features.f1.desc": { en: "Translate official letters, documents, and texts between French and English with high accuracy.", fr: "Traduisez les lettres officielles, documents et textes entre le français et l'anglais avec une grande précision." },
  "features.f2.title": { en: "Online Courses", fr: "Cours en ligne" },
  "features.f2.desc": { en: "Professional English language courses tailored for government employees at all levels.", fr: "Cours d'anglais professionnels adaptés aux employés du gouvernement à tous les niveaux." },
  "features.f3.title": { en: "Terminology Bank", fr: "Banque terminologique" },
  "features.f3.desc": { en: "A comprehensive database of government-specific terminology with translations and context.", fr: "Une base de données complète de terminologie gouvernementale avec traductions et contexte." },
  "features.f4.title": { en: "Online Meetings", fr: "Réunions en ligne" },
  "features.f4.desc": { en: "Schedule and conduct virtual meetings with built-in translation support.", fr: "Planifiez et menez des réunions virtuelles avec support de traduction intégré." },
  "features.f5.title": { en: "Secure & Compliant", fr: "Sécurisé et conforme" },
  "features.f5.desc": { en: "Enterprise-grade security for sensitive government documents with role-based access.", fr: "Sécurité de niveau entreprise pour les documents gouvernementaux sensibles avec contrôle d'accès." },

  // Stats
  "stats.ministries": { en: "Government Ministries", fr: "Ministères" },
  "stats.documents": { en: "Documents Translated", fr: "Documents traduits" },
  "stats.employees": { en: "Employees Trained", fr: "Employés formés" },
  "stats.accuracy": { en: "Translation Accuracy", fr: "Précision de traduction" },

  // Auth
  "auth.welcome": { en: "Welcome Back", fr: "Bienvenue" },
  "auth.signinDesc": { en: "Sign in to your LangGov account", fr: "Connectez-vous à votre compte LangGov" },
  "auth.email": { en: "Email", fr: "E-mail" },
  "auth.password": { en: "Password", fr: "Mot de passe" },
  "auth.noAccount": { en: "Don't have an account?", fr: "Vous n'avez pas de compte ?" },
  "auth.register": { en: "Register", fr: "S'inscrire" },
  "auth.createAccount": { en: "Create Account", fr: "Créer un compte" },
  "auth.joinPlatform": { en: "Join the LangGov platform", fr: "Rejoignez la plateforme LangGov" },
  "auth.firstName": { en: "First Name", fr: "Prénom" },
  "auth.lastName": { en: "Last Name", fr: "Nom" },
  "auth.accountType": { en: "Account Type", fr: "Type de compte" },
  "auth.selectRole": { en: "Select your role", fr: "Sélectionnez votre rôle" },
  "auth.employee": { en: "Government Employee", fr: "Employé du gouvernement" },
  "auth.manager": { en: "Department Manager", fr: "Chef de département" },
  "auth.admin": { en: "Administrator", fr: "Administrateur" },
  "auth.ministry": { en: "Ministry / Department", fr: "Ministère / Département" },
  "auth.hasAccount": { en: "Already have an account?", fr: "Vous avez déjà un compte ?" },
  "auth.checkEmail": { en: "Check your email to confirm your account before signing in.", fr: "Vérifiez votre e-mail pour confirmer votre compte avant de vous connecter." },
  "auth.administrative": { en: "Administrative", fr: "Administratif" },
  "auth.employeeRole": { en: "Employee", fr: "Employé" },
  "auth.organization": { en: "Organization", fr: "Organisation" },
  "auth.selectOrg": { en: "Select your organization", fr: "Sélectionnez votre organisation" },
  "auth.verified": { en: "Verified", fr: "Vérifié" },
  "auth.pending": { en: "Pending Approval", fr: "En attente d'approbation" },
  "auth.roleDesc.administrative": { en: "Full access to translation, courses, meetings management (requires admin approval)", fr: "Accès complet à la traduction, cours, gestion des réunions (nécessite l'approbation de l'admin)" },
  "auth.roleDesc.employee": { en: "Access to translation, courses, terminology, and join meetings", fr: "Accès à la traduction, cours, terminologie et rejoindre les réunions" },

  // Admin
  "admin.title": { en: "Admin Panel", fr: "Panneau d'administration" },
  "admin.users": { en: "Users", fr: "Utilisateurs" },
  "admin.organizations": { en: "Organizations", fr: "Organisations" },
  "admin.approve": { en: "Approve", fr: "Approuver" },
  "admin.delete": { en: "Delete", fr: "Supprimer" },
  "admin.addOrg": { en: "Add Organization", fr: "Ajouter une organisation" },
  "admin.role": { en: "Role", fr: "Rôle" },
  "admin.status": { en: "Status", fr: "Statut" },
  "admin.name": { en: "Name", fr: "Nom" },
  "admin.noAccess": { en: "You don't have access to this page", fr: "Vous n'avez pas accès à cette page" },

  // Translation page
  "translation.title": { en: "Translation", fr: "Traduction" },
  "translation.tools": { en: "Tools", fr: "Outils" },
  "translation.desc": { en: "Translate text, letters, and documents between French and English", fr: "Traduisez textes, lettres et documents entre le français et l'anglais" },
  "translation.text": { en: "Text", fr: "Texte" },
  "translation.letters": { en: "Letters", fr: "Lettres" },
  "translation.documents": { en: "Documents", fr: "Documents" },
  "translation.enterText": { en: "Enter text to translate...", fr: "Saisissez le texte à traduire..." },
  "translation.result": { en: "Translation will appear here...", fr: "La traduction apparaîtra ici..." },
  "translation.translate": { en: "Translate", fr: "Traduire" },

  // Courses page
  "courses.title": { en: "Online", fr: "En ligne" },
  "courses.title2": { en: "Courses", fr: "Cours" },
  "courses.desc": { en: "Professional English courses designed for government employees", fr: "Cours d'anglais professionnels conçus pour les employés du gouvernement" },
  "courses.start": { en: "Start Course", fr: "Commencer le cours" },
  "courses.students": { en: "students", fr: "étudiants" },
  "courses.modules": { en: "modules", fr: "modules" },

  // Terminology page
  "terminology.title": { en: "Terminology", fr: "Terminologie" },
  "terminology.bank": { en: "Bank", fr: "Banque" },
  "terminology.desc": { en: "Government-specific vocabulary database for accurate translations", fr: "Base de données terminologiques gouvernementales pour des traductions précises" },
  "terminology.search": { en: "Search in French or English...", fr: "Rechercher en français ou en anglais..." },
  "terminology.french": { en: "French", fr: "Français" },
  "terminology.english": { en: "English", fr: "Anglais" },
  "terminology.category": { en: "Category", fr: "Catégorie" },
  "terminology.context": { en: "Context", fr: "Contexte" },
  "terminology.noTerms": { en: "No terms found.", fr: "Aucun terme trouvé." },
  "terminology.termsFound": { en: "terms found", fr: "termes trouvés" },

  // Meetings
  "meetings.title": { en: "Online", fr: "En ligne" },
  "meetings.title2": { en: "Meetings", fr: "Réunions" },
  "meetings.desc": { en: "Schedule and join bilingual government meetings", fr: "Planifiez et rejoignez les réunions bilingues du gouvernement" },
  "meetings.new": { en: "New Meeting", fr: "Nouvelle réunion" },
  "meetings.upcoming": { en: "Upcoming Meetings", fr: "Réunions à venir" },
  "meetings.past": { en: "Past Meetings", fr: "Réunions passées" },
  "meetings.join": { en: "Join", fr: "Rejoindre" },
  "meetings.schedule": { en: "Schedule Meeting", fr: "Planifier la réunion" },
  "meetings.meetingTitle": { en: "Meeting Title", fr: "Titre de la réunion" },
  "meetings.date": { en: "Date", fr: "Date" },
  "meetings.time": { en: "Time", fr: "Heure" },
  "meetings.invite": { en: "Invite Participants (emails)", fr: "Inviter des participants (e-mails)" },

  // Dashboard
  "dashboard.title": { en: "Dashboard", fr: "Tableau de bord" },
  "dashboard.welcome": { en: "Welcome back! Here's your activity overview.", fr: "Bienvenue ! Voici un aperçu de votre activité." },
  "dashboard.translations": { en: "Translations", fr: "Traductions" },
  "dashboard.documents": { en: "Documents", fr: "Documents" },
  "dashboard.courseProgress": { en: "Course Progress", fr: "Progression des cours" },
  "dashboard.meetings": { en: "Meetings", fr: "Réunions" },
  "dashboard.quickAccess": { en: "Quick Access", fr: "Accès rapide" },
  "dashboard.recentActivity": { en: "Recent Activity", fr: "Activité récente" },

  // Footer
  "footer.desc": {
    en: "Helping governments transition from French to English with professional translation tools, courses, and resources.",
    fr: "Aider les gouvernements à passer du français à l'anglais avec des outils de traduction professionnels, des cours et des ressources.",
  },
  "footer.platform": { en: "Platform", fr: "Plateforme" },
  "footer.account": { en: "Account", fr: "Compte" },
  "footer.contact": { en: "Contact", fr: "Contact" },
  "footer.rights": { en: "All rights reserved.", fr: "Tous droits réservés." },
  "footer.tagline": { en: "Government Language Transition Platform", fr: "Plateforme de transition linguistique gouvernementale" },

  // Add term/course
  "terminology.addTerm": { en: "Add Term", fr: "Ajouter un terme" },
  "terminology.frLabel": { en: "French Term", fr: "Terme en français" },
  "terminology.enLabel": { en: "English Term", fr: "Terme en anglais" },
  "terminology.categoryLabel": { en: "Category", fr: "Catégorie" },
  "terminology.contextLabel": { en: "Context", fr: "Contexte" },
  "terminology.added": { en: "Term added successfully", fr: "Terme ajouté avec succès" },
  "terminology.updated": { en: "Term updated successfully", fr: "Terme mis à jour avec succès" },
  "terminology.deleted": { en: "Term deleted successfully", fr: "Terme supprimé avec succès" },
  "terminology.editTerm": { en: "Edit Term", fr: "Modifier le terme" },
  "terminology.saveTerm": { en: "Save Changes", fr: "Enregistrer" },
  "terminology.defFr": { en: "Definition (FR)", fr: "Définition (FR)" },
  "terminology.defEn": { en: "Definition (EN)", fr: "Définition (EN)" },
  "terminology.exFr": { en: "Example (FR)", fr: "Exemple (FR)" },
  "terminology.exEn": { en: "Example (EN)", fr: "Exemple (EN)" },
  "terminology.definition": { en: "Definition", fr: "Définition" },
  "terminology.example": { en: "Example", fr: "Exemple" },
  "terminology.noDefinition": { en: "No definition available", fr: "Aucune définition disponible" },
  "terminology.sort": { en: "Sort alphabetically", fr: "Trier par ordre alphabétique" },
  "terminology.actions": { en: "Actions", fr: "Actions" },
  "courses.addCourse": { en: "Add Course", fr: "Ajouter un cours" },
  "courses.editCourse": { en: "Edit Course", fr: "Modifier le cours" },
  "courses.saveCourse": { en: "Save Changes", fr: "Enregistrer" },
  "courses.updated": { en: "Course updated successfully", fr: "Cours mis à jour avec succès" },
  "courses.deleted": { en: "Course deleted successfully", fr: "Cours supprimé avec succès" },
  "courses.courseTitle": { en: "Course Title", fr: "Titre du cours" },
  "courses.courseDesc": { en: "Description", fr: "Description" },
  "courses.level": { en: "Level", fr: "Niveau" },
  "courses.duration": { en: "Duration", fr: "Durée" },
  "courses.modulesCount": { en: "Number of Modules", fr: "Nombre de modules" },
  "courses.added": { en: "Course added successfully", fr: "Cours ajouté avec succès" },
};

interface LanguageContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState<Lang>("en");

  const t = (key: string) => translations[key]?.[lang] ?? key;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
};
