import { Body, Label1 } from 'src/components';

export const PropertiesTab = () => {
	const propertiesObj = [
		{ key: 'Diploma ID', value: 'С-123244234' },
		{ key: 'Full name', value: 'Thelonious Potter' },
		{ key: 'Grade average', value: '5.8' },
		{
			key: 'Final project topic',
			value:
				'E-Commerce Website: The most demanding project which requires complete knowledge of full-stack development, technologies like MERN and MEAN can be used to build this project'
		},
		{ key: 'Mentor', value: 'Mane Tandilyan' },
		{ key: 'Completion date', value: 'November 29, 2020' }
	];

	return (
		<div>
			{propertiesObj.map((property) => (
				<div className="mb-3 flex last:mb-0" key={property.key}>
					<Body className="text-foregroundSecondary min-w-[240px]">{property.key}</Body>
					<Label1 className="max-w-[370px]">{property.value}</Label1>
				</div>
			))}
		</div>
	);
};
