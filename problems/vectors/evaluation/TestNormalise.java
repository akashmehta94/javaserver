import static org.junit.Assert.assertEquals;

import org.junit.Test;

public class TestNormalise {

	@Test
	public void testNormalise() {
		Vector vector = new Vector(1, 2, 3);
		Vector result = vector.normalise();

		// assert statements
		assertEquals("getX() must return " + (1 / Math.sqrt(14)), 1 / Math.sqrt(14), result.getX(), 0.001);
		assertEquals("getY() must return " + (2 / Math.sqrt(14)), 2 / Math.sqrt(14), result.getY(), 0.001);
		assertEquals("getZ() must return " + (3 / Math.sqrt(14)), 3 / Math.sqrt(14), result.getZ(), 0.001);
	}

} 
