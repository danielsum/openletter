import React, { Component } from 'react';
import Link from 'next/link';
import fetch from 'node-fetch';
import styled from 'styled-components';
import Footer from '../components/Footer';
import { Flex, Box } from 'reflexbox/styled-components'
import NumberFormat from 'react-number-format';
import { typography, space } from 'styled-system';
import SignatureForm from '../components/SignatureForm';
import Notification from '../components/Notification';
import SignatureEmailSent from '../components/SignatureEmailSent';
import Signatures from '../components/Signatures';

const Page = styled.div`
  max-width: 960px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: 50px;
  color: ${({ theme }) => theme.colors.primary};
`;

const Text = styled.div`
  max-width: 80ex;
`;

const BigNumber = styled.div`
  font-size: 64pt;
  ${typography}
`;

// BigNumber.defaultProps = {
//   fontSize: '64pt'
// };

const BigNumberLabel = styled.div`
  font-size: 32pt;
  margin-top: -14px;
  ${space}
  ${typography}
`;


class Letter extends Component {

  constructor(props) {
    super(props);
    this.state = { status: null };

    this.submitSignature = this.submitSignature.bind(this);
  }

  componentDidMount() {
    if (document.referrer.match(/\/confirm_signature\?token=/)) {
      this.setState({status: 'confirmed'});
    }
    if (document.referrer.match(/\/create/)) {
      this.setState({status: 'created'});
    }
  }

  async submitSignature(signature) {
    console.log(">>> submitting ", signature);
    const apiCall = `${process.env.API_URL}/letters/${this.props.letter.slug}/sign`;

    const res = await fetch(apiCall, {
        method: 'post',
        body:    JSON.stringify(signature),
        headers: { 'Content-Type': 'application/json' },
    });
    const json = await res.json();
    console.log(">>> res", json);
    this.setState({ status: 'signature_sent' });
  }

  render() {
    const { letter, error } = this.props;
    const { status } = this.state;

    if (error) {
      return (<Page><Notification title="No letter found" /></Page>);
    } else if (!letter) {
      return (<Page><Notification title="Loading..." /></Page>);
    }

    return (
      <Page>
        {status === 'created' && (
          <Notification icon="signed" title="Published!" message="Sign it and then get others to co-sign it with you." />
        )}
        {status === 'confirmed' && (
          <Notification icon="signed" title="Signed!" message="Share this open letter and get more people to sign it." />
        )}
        <Flex flexWrap='wrap'>
          <Box
            width={[1, 2 / 3]}
            p={3}>
            <Title>{letter.title}</Title>
            <Text dangerouslySetInnerHTML={{ __html: letter.text }} />
          </Box>
          <Box
            width={[1, 1 / 3]}
            p={3}>
            <Box mx={1}>
              <BigNumber fontSize={[2, 3, 4]}>
                <NumberFormat value={letter.signatures.length} displayType={'text'} thousandSeparator={true} />
              </BigNumber>
              <BigNumberLabel fontSize={[1, 2, 3]} mt={[-1, -2, -3]}>
                signatures
          </BigNumberLabel>
            </Box>
            {[null, 'created'].includes(status) && <SignatureForm onSubmit={(signature => this.submitSignature(signature))} />}
            {status === 'signature_sent' && (
              <SignatureEmailSent />
            )}
            <Signatures signatures={letter.signatures} />
          </Box>
        </Flex>
        <Footer />
      </Page>
    )
  };
}

export async function getStaticPaths() {
  const apiCall = `${process.env.API_URL}/letters`;
  console.log(">>> calling api", apiCall)
  const res = await fetch(apiCall);
  try {
    const letters = await res.json();
    const paths = [];
    letters.map(l => paths.push({ params: { slug: l.slug } }));
    return {
      paths,
      fallback: true,
    }
  } catch (e) {
    console.error("Unable to parse JSON returned by the API", e);
  }
}

export async function getStaticProps({params}) {
  const props = {};
  const apiCall = `${process.env.API_URL}/letters/${params.slug}`;
  console.log(">>> calling api", apiCall)
  const res = await fetch(apiCall);
  try {
    const response = await res.json();
    if (response.error) {
      props.error = response.error;
    } else {
      props.letter = response;
    }
    return { props };
  } catch (e) {
    console.error("Unable to parse JSON returned by the API", e);
  }
}

export default Letter;