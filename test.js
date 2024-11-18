import ChessImageGenerator from "./src/index.js";
import { Chess } from "./deps.ts";

const imageGenerator = new ChessImageGenerator.default({
  padding: [288, 44, 268, 44],
  size: 1316,
  light: '#ccc',
  dark: '#aaa'
});

const chess = new Chess()

const png = `
1. g3 e5 2. Bg2 d5 3. b3 b5 $6 4. Bb2 Bb7 $6 5. Bxe5 f6 $6 6. Bd4 Bd6 7. e3 g6 8.
Nf3 Nc6 9. Nc3 $6 a6 $6 10. Nh4 $2 Nh6 $2 11. Bxd5 $1 Nb4 $4 12. Bxb7 Rb8 13. Be4 Ng4 14.
h3 $6 Nh6 15. a3 Nc6 16. Bxc6+ Ke7 17. Bxf6+ $6 Kxf6 18. Nd5+ Ke6 19. Qf3 Rf8 20.
Qe4+ Kf7 21. c4 bxc4 22. bxc4 Qg5 23. c5 Be5 $6 24. f4 $9 Qxg3+ 25. Ke2 $1 Bxa1 26.
Rxa1 $6 Qxh4 27. Rb1 $2 Rbd8 $9 28. Nxc7 Rc8 $2 29. Bd5+ $1 Kf6 $2 30. Rb7 $9 Rcd8 $2 31.
Qe6+ $9 Kg7 32. Nxa6+ $9 Rf7 33. Rxf7+ Kh8 $2 34. Qe5+ $1 Kg8 35. Rg7+ $9 Kf8 36. Rf7+
$9 Nxf7 37. Qc7 $4 Rxd5 $1 38. c6 $2 Qxh3 39. e4 $2 Qd3+ 40. Kd1 $6 Qxa6 $9 41. Qb8+ $9
Kg7 $4 42. f5 $4 Rb5 $9 43. Qe8 $2 Rb1+ $6 44. Kc2 Rb5 45. c7 $6 Rc5+ 46. Kb3 Qb6+ 47.
Ka4 $6 Rc4# 0-1
`;

chess.loadPgn(png);

await imageGenerator.loadFEN(chess.fen());
await imageGenerator.generatePNG("test.png");
