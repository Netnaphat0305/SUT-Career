import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

type Props = {
  reportName: string;
  paymentId: number;
  method: string;
  amount: number;
  date: string;
};

const styles = StyleSheet.create({
  page: { padding: 24, fontSize: 12 },
  title: { fontSize: 18, marginBottom: 12 },
  row: { marginBottom: 6 },
});

const PaymentReportPDF: React.FC<Props> = ({ reportName, paymentId, method, amount, date }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>{reportName}</Text>
      <View style={styles.row}><Text>Payment ID: {paymentId}</Text></View>
      <View style={styles.row}><Text>Date: {new Date(date).toLocaleString()}</Text></View>
      <View style={styles.row}><Text>Method: {method}</Text></View>
      <View style={styles.row}><Text>Amount: {amount.toLocaleString()} THB</Text></View>
    </Page>
  </Document>
);

export default PaymentReportPDF;