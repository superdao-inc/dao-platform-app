import mjml2html from 'mjml';

import { footer } from './footer';

type EmailConfirmationTemplateOptions = {
	link: string;
	displayName?: string;
};

export function generateEmailConfirmationTemplate({ link, displayName }: EmailConfirmationTemplateOptions): string {
	const greeting = `Hi${displayName ? `, ${displayName}` : ''}!`;

	const input = `<mjml>
  <mj-head>
    <mj-style inline="inline">
      .orange {
        color: #FC7900;
        text-decoration: none;
      }
    </mj-style>
    <mj-attributes>
      <mj-class name="orange" color="#FC7900" />
      <mj-text padding="0px 20px" />
      <mj-button padding="0px 20px" />
      <mj-all font-family="Helvetica Neue" />
    </mj-attributes>
  </mj-head>
  <mj-body background-color="#fcf8f4">
    <mj-section padding-top="0" background-color="white">
      <mj-column>
        <mj-image padding-top="0" padding-bottom="0" src="https://app.superdao.co/assets/email-header-confett.png" />
        <mj-text font-size="30px" font-weight="700" line-height="42px">
          ${greeting}
        </mj-text>
				<mj-spacer height="16px" />
				<mj-text font-weight="400" font-size="19px" line-height="28px">
        	To confirm the new email, click on the button below
        </mj-text>
        <mj-spacer height="24px" />
        <mj-button align="left" height="48px" border-radius="8px" background-color="#FFCF01" color="black" font-size="17px" font-weight="700" line-height="24px" inner-padding="12px 24px" href="${link}">
          <mj-text font-size="17px" font-weight="700" line-height="24px">Verify new email address</mj-text>
        </mj-button>
        <mj-spacer height="36px" />
        <mj-text font-weight="400" font-size="19px" line-height="24px">
          Need help? Send us an <a class="orange" href="mailto:help@superdao.co">email</a> or reach out on <a class="orange" href="https://t.me/superdao_team">Telegram</a>
        </mj-text>
        <mj-spacer height="32px" />
        <mj-text font-weight="400" font-size="17px" line-height="24px">
          Cheers,
          <br />
          Superdao team 🦸
        </mj-text>
        <mj-spacer height="22px" />
        <mj-text font-weight="400" font-size="18px"><a href="mailto:help@superdao.co" style="color: #FC7900; text-decoration: none;">help@superdao.co</a></mj-text>
        <mj-spacer height="26px" />
      </mj-hero>
    </mj-section>
    ${footer}
  </mj-body>`;

	return mjml2html(input).html;
}
