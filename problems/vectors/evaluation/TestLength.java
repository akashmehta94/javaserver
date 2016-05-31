import static org.junit.Assert.assertEquals;

import org.junit.Test;

public class TestLength {

	@Test
	public void testLength() {
		Vector vector = new Vector(1, 2, 3);

		// assert statements
		assertEquals("length() must return " + Math.sqrt(14), Math.sqrt(14), vector.length(), 0.001);
	}

} 
