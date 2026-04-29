import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../components/ui/accordion";

const faqItems = [
  {
    id: "item-1",
    title: "How many companies can CoreComp research?",
    content:
      "Our financial data are from U.S. Securities and Exchange Commission (SEC) filings, so if the company you are looking for files with the SEC, you are able to search it with CoreComp. This means comprehensive coverage for US-listed companies.",
  },
  {
    id: "item-2",
    title: "Who is CoreComp for?",
    content:
      "CoreComp is built to be beginner-friendly enough so that even people with no background in finance can understand company fundamentals, while still being useful for experienced investors.",
  },
  {
    id: "item-3",
    title: "Help?",
    content: "If you encounter any problems, contact our support at support@corecomp.cc.",
  },
  {
    id: "item-4",
    title: "Will CoreComp have new features?",
    content:
      "CoreComp is always evolving. We continuously explore new analysis tools that can provide more value to investors.",
  },
];

export default function FAQ() {
  return (
    <Accordion type="single" collapsible className="w-full">
      {faqItems.map((item) => {
        return (
          <AccordionItem value={item.id} key={item.id}>
            <AccordionTrigger>{item.title}</AccordionTrigger>
            <AccordionContent>{item.content}</AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
