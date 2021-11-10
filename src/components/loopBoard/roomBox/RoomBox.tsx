import React from 'react';
import styled from 'styled-components';
import { AudiencePos } from '../../../client/AudienceAPI';
import APIContext from '../../../contexts/APIContext';

const grayLevel = 255;

const Container = styled.div`
  height: calc(100vh - 5rem);
  width: 100%;
  overflow: hidden;
  display: flex;
  justify-content: center;
`;

const Square = styled.div`
  height: 100%;
  width: calc(100vh - 5rem);
  background-color: rgba(${grayLevel}, ${grayLevel}, ${grayLevel}, 0.01);
  position: relative;
`;

const margin = 40;

const SubSquare = styled.div`
  background-color: rgba(${grayLevel}, ${grayLevel}, ${grayLevel}, 0.1);
  position: absolute;
  height: calc(100% - ${margin * 2}px);
  width: calc(100% - ${margin * 2}px);
  top: ${margin}px;
  left: ${margin}px;
`;

const AudienceMember = styled.div`
  position: absolute;
  margin: -10px 0 0 -10px;
  width: 20px;
  height: 20px;
  background-color: rgba(${grayLevel}, ${grayLevel}, ${grayLevel}, 0.3);
`;

const RoomBox = (
  { children }: { children: React.ReactNode },
  ref: React.ForwardedRef<HTMLDivElement | null>,
): React.ReactElement => {
  const { client } = React.useContext(APIContext);

  // Keep track of the audience members
  const [members, setMembers] = React.useState<AudiencePos[]>([]);
  React.useEffect(() => {
    if (client) {
      const sub = client.audience.positions$.subscribe((positions) => {
        console.log('We should have changed the number of positions', positions);
        setMembers(Object.values(positions));
      });
      return () => sub.unsubscribe();
    }
  }, [client]);

  return (
    <Container>
      <Square>
        <SubSquare ref={ref}>
          {members.map((member) => (
            <AudienceMember
              key={member.id}
              style={{
                top: `calc(100% * ${member.y})`,
                left: `calc(100% * ${member.x})`,
              }}
            />
          ))}
          {children}
        </SubSquare>
      </Square>
    </Container>
  );
};

export default React.forwardRef(RoomBox);
