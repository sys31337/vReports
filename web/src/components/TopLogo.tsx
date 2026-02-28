import React from 'react'

interface TopLogoProps {
  title: string;
}

const TopLogo = ({ title }: TopLogoProps) => (
  <p>{title}</p>
)

export default TopLogo
