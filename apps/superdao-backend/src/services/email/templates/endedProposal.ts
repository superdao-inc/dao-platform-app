import mjml2html from 'mjml';
import { ProposalVotingType } from 'src/entities/proposal/proposal.types';
import { footer } from './footer';
import { ProposalStartedEmailProps } from './newProposal';

export type ProposalResult = {
	text: string;
	value: number;
	isSelected: boolean;
};

export type ProposalEndedEmailProps = ProposalStartedEmailProps & {
	proposalResult: string;
	proposalVotingType?: ProposalVotingType;
};

export const generateProposalEndedTemplate = (
	{
		daoName,
		proposalHeading,
		proposalDescription,
		proposalLink,
		proposalVotingType,
		proposalResult
	}: ProposalEndedEmailProps,
	noTransform?: boolean
) => {
	const mjml = `
  <mjml>
  <mj-head>
    <mj-style>
    .bold{
      font-weight: 500;  
    }
    </mj-style>
    <mj-attributes>
      <mj-class name="orange" color="#FC7900" />
      <mj-text padding="0px 42px" align="center" />
      <mj-button padding="0px 20px" />
      <mj-all font-family="Helvetica Neue" />
    </mj-attributes>
  </mj-head>
  <mj-body background-color="#fcf8f4">
    <mj-section padding-top="0" background-color="white">
      <mj-column>
        <mj-image padding-top="0" padding-bottom="0" src="https://app.superdao.co/assets/email-header-confett.png" />

        <mj-text font-size="30px" font-weight="700" line-height="42px">
          ${daoName} voting ended
        </mj-text>
        <mj-spacer height="24px" />

        <mj-text font-weight="400" font-size="19px" line-height="28px" color="#1B202A">
          ${
						proposalVotingType === ProposalVotingType.multipleChoice
							? `The community voted for ${proposalResult}. Check the results of the voting in ${daoName}`
							: `The majority chose ${proposalResult}. Check the results of the voting in ${daoName}`
					}
        </mj-text>
        <mj-spacer height="24px" />
        <mj-wrapper padding="0px 50px">
          <mj-section background-color="#969aa31a" border-radius="8px" padding="16px 20px">
            <mj-text font-weight="600" font-size="15px" line-height="24px" color="#1B202A" align="left">${proposalHeading}</mj-text>
            <mj-spacer height="4px" />
            <mj-text font-weight="400" font-size="15px" line-height="24px" align="left">${proposalDescription}</mj-text>
          </mj-section>
        </mj-wrapper>
        <mj-spacer height="24px" />
        <mj-button align="center" height="48px" border-radius="8px" background-color="#FFCF01" color="black" font-size="17px" font-weight="700" line-height="24px" inner-padding="12px 24px" href=${proposalLink}>
          <mj-text font-size="17px" font-weight="700" line-height="24px">See results</mj-text>
        </mj-button>
        <mj-spacer height="52px" />
        ${footer}
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>
`;

	return noTransform ? mjml : mjml2html(mjml).html;
};
