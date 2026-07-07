import Anthropic from "@anthropic-ai/sdk";
import { FreelancerProject } from "../freelancer/types";

const client = new Anthropic();

const USER_PROFILE = `Systems Engineer y Junior DBA con fuerte perfil full-stack, basado en Santo Domingo, Republica Dominicana.
- Stack backend/DBA: SQL Server, Dynamics GP (SSRS, VBA/Modifier, stored procedures), administracion de bases de datos, compliance fiscal DGII (NCF/ECF) para RD.
- Stack dev: React, Next.js, Node.js, MongoDB.`;

export async function generateProposalDraft(project: FreelancerProject): Promise<string> {
  const response = await client.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 1024,
    system: `Eres un asistente que redacta borradores de propuestas para proyectos de Freelancer.com. El freelancer revisa y edita antes de enviar, asi que el tono debe ser profesional, directo y en español, sin relleno. Usa el perfil del freelancer para resaltar el match con el proyecto.

Perfil del freelancer:
${USER_PROFILE}`,
    messages: [
      {
        role: "user",
        content: `Redacta un borrador de propuesta (3-5 parrafos cortos) para este proyecto de Freelancer.com:

Titulo: ${project.title}

Descripcion:
${project.description}

Presupuesto: ${project.budget.minimum}-${project.budget.maximum ?? "?"} ${project.currency.code} (${project.type})`,
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  return textBlock?.type === "text" ? textBlock.text : "";
}
