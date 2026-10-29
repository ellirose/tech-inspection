/** Renders an address that may wrap only after the "@", never inside the domain. */
export function Email({ address }: { address: string }) {
  const at = address.indexOf("@");
  if (at < 0) return <>{address}</>;
  return (
    <>
      <span className="whitespace-nowrap">{address.slice(0, at)}</span>
      <wbr />
      <span className="whitespace-nowrap">{address.slice(at)}</span>
    </>
  );
}
