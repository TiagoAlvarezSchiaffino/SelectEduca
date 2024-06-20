export default function formatMeetingMinutes(minutes: string): string {
    let sections = minutes.split("\n\n");
    const todoIndex = sections.findIndex(s => s.startsWith("Meeting to be done"));
    if (todoIndex >= 0) {
      const summarySection = sections.slice(1, todoIndex);
      const todoSection = sections.slice(todoIndex + 1);
      sections = [
        "## Meeting to be done",
        ...todoSection.map(s => formatTodoSection(s)),
        "## Meeting summary",
        ...summarySection.map(s => formatSummarySection(s)),
      ];
    } else {
      sections = [
        "## Meeting summary",
        ...sections.slice(1).map(s => formatSummarySection(s)),
      ];
    }
  
    return sections.join("\n\n\n");
  }
  
  function formatTodoSection(section: string): string {
      return section.replaceAll("· ", "* ");
  }
  
  function formatSummarySection(section: string): string {
      const lines = section.split("\n");
      return lines.length == 0 ? section : [
        `**${lines[0]}**`,
        ...lines.slice(1),
      ].join("\n\n");
  }